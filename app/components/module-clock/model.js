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
     // - actually fire clock events
     // - calculate ms offsets for fractional events and adjust target timestamps for outgoing events

    if (this.isStarted) {
      let ticksPerBeat = get(this, 'resInPort').getValue();
      let midiEventsPerTick = midiTimingEventsPerBeat / ticksPerBeat;

      if (this.latestTickSentAt == null) {
        console.log(this.midiEventCount, 'send 0');
        this.latestTickSentAt = 0;
        this.midiEventCount = 1;
      } else if (this.latestTickSentAt + midiEventsPerTick <= this.midiEventCount) {
        console.log(this.midiEventCount, 'send', this.latestTickSentAt + midiEventsPerTick);
        this.latestTickSentAt = this.latestTickSentAt + midiEventsPerTick - this.midiEventCount;
        this.midiEventCount = 1;
      } else {
        this.midiEventCount++;
      }

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

      } else if (get(this, 'source') === 'External') {
        event.outputTime = event.targetTime + latency;
        event.callbackTime = event.targetTime; // no callback right now, we're passing the external event straight through
        event.duration = 20; // a guess: 1/24 of a beat at 120 bpm. Todo: calculate based on previous event timestamp

      } else {
        console.log('error sending trigger, unrecognized source setting of', get(this, 'sourceSetting.value'));
        return;
      }

      if (get(this, 'trigOutPort.isConnected')) {
        // add some latency to the midi output time to allow room for callback inaccuracy and event execution
        get(this, 'trigOutPort').sendEvent({
          targetTime: event.targetTime,
          outputTime: event.outputTime,
          callbackTime: event.callbackTime,
          duration: event.duration
        });
        set(this, 'latestTriggerTime', event.targetTime);
      }
    }
  },

  mod(num, mod) {
    let remain = num % mod;
    return Math.floor(remain >= 0 ? remain : remain + mod);
  }

});
