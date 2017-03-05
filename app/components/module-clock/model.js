import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  inject,
  observer,
  get,
  set
} = Ember;

const {
  belongsTo,
  attr
} = DS;

const defaultRes = 4; // ticks per beat
const defaultTempo = 120;
const latency = 10;
const midiTimingEventsPerBeat = 24; // always the case AFAIK

export default Module.extend({

  type: 'module-clock', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Clock',

  midi: inject.service(),
  scheduler: inject.service(),

  // external properties, use Ember getters and setters
  isStarted: false,
  tempoInPort: belongsTo('port-value-in', { async: false }),
  resInPort: belongsTo('port-value-in', { async: false }),
  resetOutPort: belongsTo('port-event-out', { async: false }),
  trigOutPort: belongsTo('port-event-out', { async: false }),

  source: attr('string', { defaultValue: 'Internal' }),

  // component can observe this to know when an event fired
  latestTriggerTime: null,
  // ms between events based current tempo and resolution
  tickDuration: null,

  // for converting from midi timing events to clock-resolution events in onMidiTimingClock()
  midiEventCount: 0,
  latestTickSentAt: null,
  latestMidiEventTimestamp: null,

  onSourceChanged: observer('source', function() {
    if (get(this, 'source') === 'Internal') {
      console.log('clock: use internal source');
      get(this, 'midi').timingListener = null;
      if (this.isStarted) { // reset the internal clock
        this.start();
      }
    } else if (get(this, 'source') === 'External') {
      console.log('clock: use external source');
      get(this, 'midi').timingListener = this;
      this.latestTickSentAt = null; // reset timing for external events
    } else {
      console.log('error: tried to update source to', get(this, 'sourceSetting.value'));
    }

    if (get(this, 'hasDirtyAttributes')) {
      this.requestSave();
    }

  }),

  ready() {
    if (get(this, 'isNew')) {
      // create settings
      this.addMenuSetting('Source', 'source', this, ['Internal', 'External']);

      // create ports
      this.addValueInPort('tempo', 'tempoInPort', { isEnabled: false, defaultValue: defaultTempo, minValue: 1 });
      this.addValueInPort('res', 'resInPort', { isEnabled: false, defaultValue: defaultRes, minValue: 1, maxValue: 24 });

      this.addEventOutPort('reset', 'resetOutPort', false);
      this.addEventOutPort('trig', 'trigOutPort', true);
      console.log('module-clock.didCreate() requestSave()');
      this.requestSave();
    }
  },

  start() {
    if (get(this, 'isStarted')) {
      this.reset();
    }
    set(this, 'isStarted', true);
    if (get(this, 'source') === 'Internal') {
      get(this, 'scheduler').queueEvent(
        { targetTime: performance.now(),
          outputTime: performance.now() + latency
        },
        this.sendEvent.bind(this)
      );
    } else {
      this.latestTickSentAt = null; // reset timing for external events
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
    this.latestTickSentAt = null; // reset timing for external events
  },

  onMidiTimingClock(event) {
    /* Receive 24-events-per-beat midi time signals and send out internal
     * clock signals of arbitrary ticks-per-beat resolution. If the resolution
     * is equally divisible by 24, this is simple. If it's not (e.g. 5, 7, 9 ticks per beat)
     * then we have to do some work to try to fire them accurately.
     */

     // todo:
     // - calculate ms offsets for fractional events and adjust target timestamps for outgoing events

    if (this.isStarted) {
      let ticksPerBeat = get(this, 'resInPort').getValue();
      let midiEventsPerTick = midiTimingEventsPerBeat / ticksPerBeat;

      if (this.latestTickSentAt == null) {
        // fire an event for the first midi timing event in a series

        if (get(this, 'trigOutPort.isConnected')) {

          // if we don't know the tick duration, make something up.
          let tickDuration = get(this, 'tickDuration') ? get(this, 'tickDuration') : 500 / ticksPerBeat;

          get(this, 'trigOutPort').sendEvent({
            targetTime: event.timeStamp,
            outputTime: event.timeStamp + latency,
            callbackTime: event.timeStamp,
            duration: tickDuration
          });
          set(this, 'latestTriggerTime', event.timeStamp);
          set(this, 'tickDuration', tickDuration);
        }

        this.latestTickSentAt = 0;
        this.midiEventCount = 1;

      } else if (this.latestTickSentAt + midiEventsPerTick <= this.midiEventCount) {
        // fire an event for a subsequent midi timing event in a series

        // calculate the tick duration
        let tickDuration = (event.timeStamp - this.latestMidiEventTimestamp) * 24 / ticksPerBeat;

        if (get(this, 'trigOutPort.isConnected')) {
          get(this, 'trigOutPort').sendEvent({
            targetTime: event.timeStamp,
            outputTime: event.timeStamp + latency,
            callbackTime: event.timeStamp,
            duration: tickDuration
          });
          set(this, 'latestTriggerTime', event.timeStamp);
          set(this, 'tickDuration', tickDuration);
        }

        this.latestTickSentAt = this.latestTickSentAt + midiEventsPerTick - this.midiEventCount;
        this.midiEventCount = 1;


      } else {
        // no event scheduled to fire
        this.midiEventCount++;
      }

      this.latestMidiEventTimestamp = event.timeStamp;

    }

  },

  sendEvent(event) {
    if (this.isStarted) {
      if (get(this, 'source') === 'Internal') {
        // internal events get accurate target times based on tempo, resolution, and start time
        let tempo = get(this, 'tempoInPort').getValue();
        let res = get(this, 'resInPort').getValue();
        set(this, 'tickDuration', 60000 / (tempo * res)); // milliseconds per tick

        get(this, 'scheduler').queueEvent(
          { targetTime: event.targetTime + get(this, 'tickDuration'),
            outputTime: event.outputTime + get(this, 'tickDuration')
          },
          this.sendEvent.bind(this)
        );

        event.duration = get(this, 'tickDuration');

      } else if (get(this, 'source') !== 'External') {
        console.log('error sending trigger, unrecognized source setting of', get(this, 'sourceSetting.value'));
        return;
      }

      if (get(this, 'trigOutPort.isConnected')) {
        get(this, 'trigOutPort').sendEvent(event);
        set(this, 'latestTriggerTime', event.targetTime);
      }
    }
  }

});
