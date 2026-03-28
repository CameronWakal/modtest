import { tracked } from '@glimmer/tracking';
import { hasMany, attr } from '@ember-data/model';
import Port from '../port/model';

export default class PortValueInModel extends Port {
  type = 'port-value-in'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  @hasMany('port-value-out', { async: false, inverse: 'connections' }) connections;
  @attr('boolean') canBeEmpty;
  @attr('number') defaultValue;
  @attr('number') minValue;
  @attr('number') maxValue;
  @attr('number') disabledValue;
  @attr('string') disabledValueChangedMethod; // method to notify the module that the disabled value has changed

  // Module values are not computed properties for performance reasons. However, everything in the templates is
  // rendered using computed properties. This computedValue property can be used to watch the most recently
  // fetched value. It's updated on getValue().
  @tracked computedValue = null;

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
  }

  // Note: disabledValue changes are handled by port-setting/component.js updateDisabledValue()

  getValue() {
    let result;

    if (!this.isEnabled) {
      // Assume disabledValue has already been validated against canBeEmpty, min, max
      result = this.disabledValue;
    } else {
      // Sum all input values but leave the result as null if all inputs are null
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
        // Use defaultValue instead of null if canBeEmpty is false
        if (!this.canBeEmpty) {
          totalValue = this.defaultValue;
        }
      } else {
        // Enforce min and max value if present
        if (this.minValue != null) {
          totalValue = Math.max(totalValue, this.minValue);
        }
        if (this.maxValue != null) {
          totalValue = Math.min(totalValue, this.maxValue);
        }
      }

      result = totalValue;
    }

    // Only update tracked property if value changed to avoid unnecessary Glimmer renders
    if (this.computedValue !== result) {
      this.computedValue = result;
    }
    return result;
  }
}
