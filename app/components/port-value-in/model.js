import { get, set, observer } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { hasMany, attr } from '@ember-data/model';
import Port from '../port/model';

export default Port.extend({

  type: 'port-value-in', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  connections: hasMany('port-value-out', { async: true }),
  canBeEmpty: attr('boolean'),
  defaultValue: attr('number'),
  minValue: attr('number'),
  maxValue: attr('number'),
  disabledValue: attr('number'),
  disabledValueChangedMethod: attr('string'), // method to notify the module that the disabled value has changed

  // module values are not computed properties for performance reasons. However, everything in the templates is
  // rendered using computed properties. This ComputedValue property can be used to watch the most recently
  // fetched value. It's updated on getValue().
  computedValue: null,

  copy() {
    let newPort = this.store.createRecord('port-value-in', {
      label: this.label,
      isEnabled: this.isEnabled,
      canBeEmpty: this.canBeEmpty,
      defaultValue: this.defaultValue,
      disabledValue: this.disabledValue,
      disabledValueChangedMethod: this.disabledValueChangedMethod,
      minValue: this.minValue,
      maxValue: this.maxValue,
      portGroup: this.portGroup
    });
    newPort.save();
    return newPort;
  },

  onDisabledValueChanged: observer('disabledValue', function() {
    if (this.hasDirtyAttributes && !this.isNew) {

      let methodName = this.disabledValueChangedMethod;
      if (!isEmpty(methodName)) {
        let methodToCall = get(this.module, methodName).bind(this.module);
        methodToCall();
      }

      // save me so my attributes are marked as clean, request module save to persist changes.
      this.save();
      this.requestSave();
    }
  }),

  getValue() {
    if (!this.isEnabled) {
      // assume disabledValue has already been validated against canBeEmpty, min, max
      set(this, 'computedValue', this.disabledValue);
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

    set(this, 'computedValue', totalValue);
    return totalValue;
  }

});
