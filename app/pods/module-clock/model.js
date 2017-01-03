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

  // internal property: no need to get/set
  tickDuration: null,

  source: attr('string', { defaultValue: 'Internal' }),

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
      this.addValueInPort('tempo', 'tempoInPort', false);
      this.addValueInPort('res', 'resInPort', false);
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

  sendEvent(event) {
    if (this.isStarted) {
      if (get(this, 'source') === 'Internal') {
        // internal events get accurate target times based on tempo, resolution, and start time
        let tempo = get(this, 'tempoInPort').getValue();
        if (tempo == null) {
          tempo = defaultTempo;
        }

        let res = get(this, 'resInPort').getValue();
        if (res == null) {
          res = defaultRes;
        }

        this.tickDuration = 60000 / (tempo * res); // milliseconds per tick

        get(this, 'scheduler').queueEvent(
          { targetTime: event.targetTime + this.tickDuration,
            outputTime: event.outputTime + this.tickDuration
          },
          this.sendEvent.bind(this)
        );

      } else if (get(this, 'source') !== 'External') {
        console.log('error sending trigger, unrecognized source setting of', get(this, 'sourceSetting.value'));
        return;
      }

      // add some latency to the midi output time to allow room for callback inaccuracy and event execution
      get(this, 'trigOutPort').sendEvent({
        targetTime: event.targetTime,
        outputTime: event.outputTime,
        callbackTime: event.callbackTime
      });
    }
  }

});
