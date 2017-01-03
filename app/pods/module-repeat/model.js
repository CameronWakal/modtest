import Ember from 'ember';
import Module from '../module/model';
import DS from 'ember-data';

const {
  get,
  inject
} = Ember;

const {
  belongsTo
} = DS;

export default Module.extend({

  type: 'module-repeat', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Repeat',

  scheduler: inject.service(),

  tempoInPort: belongsTo('port-value-in', { async: false }),
  countInPort: belongsTo('port-value-in', { async: false }), // number of times to repeat
  durationInPort: belongsTo('port-value-in', { async: false }), // number of beats to fill with repeats
  trigOutPort: belongsTo('port-event-out', { async: false }),

  onEventIn(event) {
    let tempo = get(this, 'tempoInPort').getValue();
    let count = this.get('countInPort').getValue();
    let duration = this.get('durationInPort').getValue();
    if (tempo == null) {
      tempo = 120;
    }
    if (count == null) {
      count = 0;
    }
    if (duration == null) {
      duration = 1;
    }

    if (count <= 0 || duration <= 0) {
      return;
    }

    let repeatsPerBeat = (count + 1) / duration;
    let msPerRepeat = 60000 / (tempo * repeatsPerBeat);

    for (let i = 0; i < count; i++) {
      get(this, 'scheduler').queueEvent(
        { targetTime: event.targetTime + (msPerRepeat * (i + 1)),
          outputTime: event.outputTime + (msPerRepeat * (i + 1))
        },
        this.sendEvent.bind(this)
      );
    }

  },

  sendEvent(event) {
    get(this, 'trigOutPort').sendEvent(event);
  },

  ready() {
    if (this.get('isNew')) {
      this.addEventInPort('trig', 'onEventIn', true);
      this.addValueInPort('tempo', 'tempoInPort', true);
      this.addValueInPort('count', 'countInPort', true);
      this.addValueInPort('duration', 'durationInPort', true);
      this.addEventOutPort('trig', 'trigOutPort', true);
      console.log('module-repeat.didCreate() requestSave()');
      this.requestSave();
    }
  },

  mod(num, mod) {
    let remain = num % mod;
    return Math.floor(remain >= 0 ? remain : remain + mod);
  }

});