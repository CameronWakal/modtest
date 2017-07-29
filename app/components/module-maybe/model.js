import DS from 'ember-data';
import Ember from 'ember';
import Module from '../module/model';

const {
  belongsTo
} = DS;

const {
  get,
  set
} = Ember;

export default Module.extend({

  type: 'module-maybe', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  eventInPort: belongsTo('port-event-in', { async: false }),
  eventOutPort: belongsTo('port-event-out', { async: false }),
  numeratorInPort: belongsTo('port-value-in', { async: false }),
  denominatorInPort: belongsTo('port-value-in', { async: false }),

  onEventIn(event) {
    let numerator = get(this, 'numeratorInPort').getValue();
    let denominator = get(this, 'denominatorInPort').getValue();

    let prob = numerator / denominator;
    let rand = Math.random();

    if (rand <= prob) {
      get(this, 'eventOutPort').sendEvent(event);
    }

  },

  ready() {
    if (get(this, 'isNew')) {
      set(this, 'title', 'Maybe');

      // create ports
      this.addEventInPort('in', 'onEventIn', true);
      this.addEventOutPort('out', 'eventOutPort', true);

      this.addValueInPort('numerator', 'numeratorInPort', { defaultValue: 1, minValue: 0, isEnabled: false });
      this.addValueInPort('denominator', 'denominatorInPort', { defaultValue: 2, minValue: 1, isEnabled: false });

      console.log('module-maybe.didCreate() requestSave()');
      this.requestSave();
    }
  }

});
