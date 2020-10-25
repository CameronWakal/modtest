import { set, get } from '@ember/object';
import DS from 'ember-data';
import Module from '../module/model';

const {
  belongsTo
} = DS;

export default Module.extend({

  type: 'module-button', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Button',

  eventOutPort: belongsTo('port-event-out', { async: false }),

  trig() {
    this.eventOutPort.sendEvent({
      targetTime: performance.now(),
      callbackTime: performance.now()
    });
  },

  init() {
    this._super(...arguments);
    if (this.isNew) {
      set(this, 'title', this.name);
      // create ports
      this.addEventOutPort('out', 'eventOutPort', true);

      console.log('module-value didCreate saveLater');
      this.requestSave();
    }
  }

});
