import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  observer,
  get
} = Ember;

const {
  attr,
  belongsTo
} = DS;

const latency = 10;

export default Module.extend({

  type: 'module-value', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Value',
  value: attr('number'),

  changeOutPort: belongsTo('port-event-out', { async: false }),

  getValue() {
    return get(this, 'value');
  },

  ready() {
    if (get(this, 'isNew')) {
      // create ports
      this.addValueOutPort('value', 'getValue', true);
      this.addEventOutPort('changed', 'changeOutPort', false);
      console.log('module-value didCreate saveLater');
      this.requestSave();
    }
  },

  onValueChanged: observer('value', function() {

    if (get(this, 'hasDirtyAttributes')) {

      let changeEvent = {
        targetTime: performance.now(),
        outputTime: performance.now() + latency,
        callbackTime: performance.now()
      };
      get(this, 'changeOutPort').sendEvent(changeEvent);

      console.log('module-value.onValueChanged() requestSave()');
      this.requestSave();
    }

  })

});
