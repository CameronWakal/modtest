import { set, get, observer } from '@ember/object';
import DS from 'ember-data';
import Module from '../module/model';

const {
  attr,
  belongsTo
} = DS;

const latency = 10;

export default Module.extend({

  type: 'module-value', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Value',

  value: attr('number'),
  changeOutPort: belongsTo('port-event-out', { async: false }),

  valueInPort: belongsTo('port-value-in', { async: false }),

  getValue() {
    return get(this, 'value');
  },

  setValue() {
    let value = get(this, 'valueInPort').getValue();
    set(this, 'value', value);
    this.requestSave();
  },

  ready() {
    if (get(this, 'isNew')) {
      set(this, 'title', this.name);
      // create ports
      this.addEventInPort('set', 'setValue', false);
      this.addValueInPort('value', 'valueInPort', { isEnabled: false });
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
