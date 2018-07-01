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
    if (this.hasDirtyAttributes && !this.isNew) {
      console.log('port-value-in disabledValueChanged');

      let methodName = this.disabledValueChangedMethod;
      if (!isEmpty(methodName)) {
        let methodToCall = get(this.module, methodName).bind(this.module);
        methodToCall();
      }

      this.requestSave();
    }
  }),

  getValue() {
    if (!this.isEnabled) {
      // assume disabledValue has already been validated against canBeEmpty, min, max
      return this.disabledValue;
    }

    // sum all input values but leave the result as null if all inputs are null
    let value = null;
    let totalValue = null;
    this.connections.forEach((port) => {
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
      if (!this.canBeEmpty) {
        totalValue = this.defaultValue;
      }
    } else {
      // enforce min and max value if present
      if (this.minValue != null) {
        totalValue = Math.max(totalValue, this.minValue);
      }
      if (this.maxValue != null) {
        totalValue = Math.min(totalValue, this.maxValue);
      }
    }

    return totalValue;
  }

});
