import { set, get, observer } from '@ember/object';
import { belongsTo, attr } from '@ember-data/model';
import Module from '../module/model';

export default Module.extend({

  type: 'module-value', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Value',

  value: attr('number'),
  changeOutPort: belongsTo('port-event-out', { async: false }),

  valueInPort: belongsTo('port-value-in', { async: false }),

  onValueChanged: observer('value', function() {
    if (this.hasDirtyAttributes) {
      let changeEvent = {
        targetTime: performance.now(),
        callbackTime: performance.now()
      };
      this.changeOutPort.sendEvent(changeEvent);

      console.log('module-value.onValueChanged() requestSave()');
      this.requestSave();
    }

  }),

  getValue() {
    return this.value;
  },

  setValue() {
    let value = this.valueInPort.getValue();
    set(this, 'value', value);
    this.requestSave();
  },

  init() {
    this._super(...arguments);
    if (this.isNew) {
      set(this, 'title', this.name);
      // create ports
      this.addEventInPort('set', 'setValue', false);
      this.addValueInPort('value', 'valueInPort', { isEnabled: false });
      this.addValueOutPort('value', 'getValue', true);
      this.addEventOutPort('changed', 'changeOutPort', false);
      console.log('module-value didCreate saveLater');
      this.requestSave();
    }
  }

});
