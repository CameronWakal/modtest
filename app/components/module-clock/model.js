import { inject as service } from '@ember/service';
import { set, get, observer } from '@ember/object';
import DS from 'ember-data';
import Module from '../module/model';

const {
  belongsTo,
  attr
} = DS;

const defaultRes = 4; // ticks per beat
const defaultTempo = 120;
const latency = 10;
const midiTimingEventsPerBeat = 24; // always the case AFAIK

export default Module.extend({

  midi: service(),
  scheduler: service(),

  type: 'module-clock', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Clock',

  isStarted: false,
  // last time an internal event was sent out.
  latestTriggerTime: null,
  // milliseconds between events. This is either:
  // calculated based on tempo and resolution (internal mode)
  // estimated based on frequency of incoming events (external mode)
  tickDuration: null,
  // timestamp of latest midi event so we can infer the external tempo between two events (external mode)
  latestMidiEventTimestamp: null,
  // number of midi timing events that have been received since the beginning of the current beat (external mode)
  midiEventCount: null,

  sourceMenuValues: ['Internal', 'External'],

  tempoInPort: belongsTo('port-value-in', { async: false }),
  resInPort: belongsTo('port-value-in', { async: false }),
  resetOutPort: belongsTo('port-event-out', { async: false }),
  trigOutPort: belongsTo('port-event-out', { async: false }),
  source: attr('string', { defaultValue: 'Internal' }),

  onSourceChanged: observer('source', function() {
    if (get(this, 'source') === 'Internal') {
      get(this, 'midi').timingListener = null;
      if (this.isStarted) { // reset the internal clock
        this.start();
      }
    } else if (get(this, 'source') === 'External') {
      get(this, 'midi').timingListener = this;
      this.resetExternalTimer();
    }
    if (get(this, 'hasDirtyAttributes')) {
      this.requestSave();
    }
  }),

  ready() {
    if (get(this, 'isNew')) {
      set(this, 'title', this.name);

      this.addMenuSetting('Source', 'source', 'sourceMenuValues', this);
      this.addValueInPort('tempo', 'tempoInPort', { isEnabled: false, defaultValue: defaultTempo, minValue: 1 });
      this.addValueInPort('res', 'resInPort', { isEnabled: false, defaultValue: defaultRes, minValue: 1, maxValue: 24 });
      this.addEventOutPort('reset', 'resetOutPort', false);
      this.addEventOutPort('trig', 'trigOutPort', true);
      this.requestSave();
    }
  },

  start() {
    if (get(this, 'isStarted')) {
      this.reset();
    }
    set(this, 'isStarted', true);
    if (get(this, 'source') === 'Internal') {
      this.queueEvent({
        targetTime: performance.now(),
        outputTime: performance.now() + latency
      });
    } else {
      this.resetExternalTimer();
    }
  },

  stop() {
    if (!get(this, 'isStarted')) {
      this.reset();
    }
    set(this, 'isStarted', false);
  },

  reset() {
    get(this, 'resetOutPort').sendEvent();
  },

  onMidiTimingClock(event) {
    // todo: calculate ms offsets for fractional events and adjust target timestamps for outgoing events

    if (this.isStarted) {
      let ticksPerBeat = get(this, 'resInPort').getValue();
      let midiEventsPerTick = midiTimingEventsPerBeat / ticksPerBeat;
      let midiEventDuration, tickDuration, outputEvent;

      // to decide whether to fire an internal event, we compare the number of events expected to
      // have fired as of the previous midi event, versus the number expected to have fired after
      // the current event, then compare the two.
      let previousEventCount = Math.floor(this.midiEventCount / midiEventsPerTick);
      let currentEventCount = Math.floor((this.midiEventCount + 1) / midiEventsPerTick);

      // this is the first event in a continuous series. Use the tickDuration from the
      // previous continuous series, or if there is no previous tickDuration, make one up.
      // Reset the internal state.
      if (this.midiEventCount == null) {
        // guess a tickDuration based on 120bpm if there isn't an existing tickDuration
        tickDuration = get(this, 'tickDuration') ? get(this, 'tickDuration') : 500 / ticksPerBeat;
        this.midiEventCount = 0;

        // form and send the output event
        outputEvent = {
          targetTime: event.timeStamp,
          outputTime: event.timeStamp + latency,
          callbackTime: performance.now(),
          duration: tickDuration
        };
        this.sendEvent(outputEvent);

        // enough 24-events-per-beat midi events have come through since the last internal tick
        // event was sent that it's time to send another internal tick event. calculate the duration
        // based on the time elapsed between the current and previous midi events.
      } else if (previousEventCount != currentEventCount) {
        midiEventDuration = event.timeStamp - this.latestMidiEventTimestamp;
        tickDuration = midiEventDuration * 24 / ticksPerBeat;

        // for when ticksPerBeat is not evenly divisible by the 24-events-per-beat midi clock signal,
        // we calculate the fraction of a midi event that the tick is supposed to fire on, and adjust
        // the target timestamp of the trigger event by that amount.
        let fractionOfMidiEventCount = currentEventCount * midiEventsPerTick - this.midiEventCount;
        let adjustedTargetTimestamp = event.timeStamp + (fractionOfMidiEventCount * midiEventDuration);

        // form and send the output event
        outputEvent = {
          targetTime: adjustedTargetTimestamp,
          outputTime: adjustedTargetTimestamp + latency,
          callbackTime: performance.now(),
          duration: tickDuration
        };
        this.sendEvent(outputEvent);
      }

      // increment the internal state.
      this.midiEventCount = (this.midiEventCount + 1) % 24;
      this.latestMidiEventTimestamp = event.timeStamp;

    }

  },

  // the series of continuous external events has been interrupted.
  // reset latestTickSentAt, so onMidiTimingClock knows it can't infer
  // the external tempo on the next event.
  resetExternalTimer() {
    this.midiEventCount = null;
  },

  onSchedulerCallback(event) {
    if (this.isStarted && get(this, 'source') === 'Internal') {

      // calculate the tickDuration to use for the duration of the current event,
      // and to schedule the next event.
      let tempo = get(this, 'tempoInPort').getValue();
      let res = get(this, 'resInPort').getValue();
      let tickDuration = 60000 / (tempo * res);// milliseconds per tick

      // schedule the next event
      this.queueEvent({
        targetTime: event.targetTime + tickDuration,
        outputTime: event.outputTime + tickDuration
      });

      // prepare and send the current event
      event.duration = tickDuration;
      this.sendEvent(event);
    }
  },

  queueEvent(event) {
    get(this, 'scheduler').queueEvent(event, this.onSchedulerCallback.bind(this));
  },

  sendEvent(event) {
    if (get(this, 'trigOutPort.isConnected')) {
      set(this, 'latestTriggerTime', event.targetTime);
      set(this, 'tickDuration', event.duration);
      get(this, 'trigOutPort').sendEvent(event);
    }
  }

});
