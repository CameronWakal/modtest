import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  inject,
  observer
} = Ember;

const {
  belongsTo,
  attr
} = DS;

export default Module.extend({

  type: 'module-clock', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Clock',

  midi: inject.service(),

  // external properties, use Ember getters and setters
  isStarted: false,
  tempoInPort: belongsTo('port-value-in', { async: false }),
  resInPort: belongsTo('port-value-in', { async: false }),
  resetOutPort: belongsTo('port-event-out', { async: false }),
  trigOutPort: belongsTo('port-event-out', { async: false }),

  // internal properties, don't use Ember getters and setters
  defaultRes: 24, // ticks per beat
  defaultTempo: 120, // beats per minute
  startTime: null,
  tickCount: null,
  tickDuration: null,
  latency: 10, // milliseconds to add to the eventual midi event's timestamp to achieve stable timing

  source: attr('string', { defaultValue: 'Internal' }),
  onSourceChanged: observer('source', function() {
    if (this.get('source') === 'Internal') {
      console.log('clock: use internal source');
      this.get('midi').timingListener = null;
      if (this.isStarted) { // reset the internal clock
        this.start();
      }
    } else if (this.get('source') === 'External') {
      console.log('clock: use external source');
      this.get('midi').timingListener = this;
    } else {
      console.log('error: tried to update source to', this.get('sourceSetting.value'));
    }

    if (this.get('hasDirtyAttributes')) {
      this.requestSave();
    }

  }),

  ready() {
    if (this.get('isNew')) {
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
    if (this.get('isStarted')) {
      this.reset();
    }
    this.set('isStarted', true);
    if (this.get('source') === 'Internal') {
      this.startTime = window.performance.now();
      this.tickCount = 0;
      this.sendTrigger();
    }
  },

  stop() {
    if (!this.get('isStarted')) {
      this.reset();
    }
    this.set('isStarted', false);
  },

  reset() {
    this.get('resetOutPort').sendEvent();
  },

  sendTrigger(receivedTime) {
    if (this.isStarted) {
      let targetTime;
      let currentTime = window.performance.now();

      if (this.get('source') === 'External') {
        // external event is not timestamped, send it through right away
        targetTime = receivedTime;
      } else if (this.get('source') === 'Internal') {
        // internal events get accurate target times based on tempo, resolution, and start time
        let tempo = this.get('tempoInPort').getValue();
        if (tempo == null) {
          tempo = this.defaultTempo;
        }

        let res = this.get('resInPort').getValue();
        if (res == null) {
          res = this.defaultRes;
        }

        let newTickDuration = 60000 / (tempo * res); // milliseconds per tick

        // if the tempo or resolution has changed, reset the startTime and tickCount
        if (this.tickDuration !== newTickDuration) {
          this.startTime += this.tickCount * this.tickDuration;
          this.tickCount = 0;
          this.tickDuration = newTickDuration;
        }

        // schedule a callback to self for the next trigger interval.
        targetTime = this.startTime + (this.tickCount * this.tickDuration);
        let nextTickDelay = this.tickDuration - (currentTime - targetTime);
        window.setTimeout(this.sendTrigger.bind(this), nextTickDelay);

        this.tickCount++;
      } else {
        console.log('error sending trigger, unrecognized source setting of', this.get('sourceSetting.value'));
        return;
      }

      // add some latency to the midi output time to allow room for callback inaccuracy and event execution
      let outputTime = targetTime + this.latency;
      this.get('trigOutPort').sendEvent({
        targetTime,
        outputTime,
        currentTime
      });
    }
  }

});
