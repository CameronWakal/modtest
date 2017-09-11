import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  get,
  set
} = Ember;

const {
  belongsTo
} = DS;

const latency = 10;

export default Module.extend({

  type: 'module-button', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Button',

  eventOutPort: belongsTo('port-event-out', { async: false }),

  trig() {
    get(this, 'eventOutPort').sendEvent({
      targetTime: performance.now(),
      callbackTime: performance.now(),
      outputTime: performance.now() + latency
    });
  },

  ready() {
    if (get(this, 'isNew')) {
      set(this, 'title', this.name);
      // create ports
      this.addEventOutPort('out', 'eventOutPort', true);

      console.log('module-value didCreate saveLater');
      this.requestSave();
    }
  }

});
