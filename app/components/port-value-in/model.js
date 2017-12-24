import { get, observer } from '@ember/object';
import { isEmpty } from '@ember/utils';
import DS from 'ember-data';
import Port from '../port/model';

const {
  hasMany,
  attr
} = DS;

export default Port.extend({

  type: 'port-value-in', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  connections: hasMany('port-value-out', { async: true }),
  canBeEmpty: attr('boolean'),
  defaultValue: attr('number'),
  minValue: attr('number'),
  maxValue: attr('number'),
  disabledValue: attr('number'),
  disabledValueChangedMethod: attr('string'), // method to notify the module that the disabled value has changed

  onDisabledValueChanged: observer('disabledValue', function() {
    if (get(this, 'hasDirtyAttributes') && !get(this, 'isNew')) {
      console.log('port-value-in disabledValueChanged');

      let module = get(this, 'module');
      let methodName = get(this, 'disabledValueChangedMethod');
      if (!isEmpty(methodName)) {
        let methodToCall = get(module, methodName).bind(module);
        methodToCall();
      }

      this.requestSave();
    }
  }),

  getValue() {
    if (!get(this, 'isEnabled')) {
      // assume disabledValue has already been validated against canBeEmpty, min, max
      return get(this, 'disabledValue');
    }

    // sum all input values but leave the result as null if all inputs are null
    let value = null;
    let totalValue = null;
    get(this, 'connections').forEach((port) => {
      value = parseInt(port.getValue());
      if (!isNaN(value)) {
        if (totalValue == null) {
          totalValue = 0;
        }
        totalValue += value;
      }
    });

    if (totalValue == null) {
      // use defaultValue instead of null if canBeEmpty is false
      if (!get(this, 'canBeEmpty')) {
        totalValue = get(this, 'defaultValue');
      }
    } else {
      // enforce min and max value if present
      if (get(this, 'minValue') != null) {
        totalValue = Math.max(totalValue, get(this, 'minValue'));
      }
      if (get(this, 'maxValue') != null) {
        totalValue = Math.min(totalValue, get(this, 'maxValue'));
      }
    }

    return totalValue;
  }

});
