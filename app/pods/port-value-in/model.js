import Ember from 'ember';
import DS from 'ember-data';
import Port from '../port/model';

const {
  observer
} = Ember;

const {
  hasMany,
  attr
} = DS;

export default Port.extend({

  type: 'port-value-in', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  connections: hasMany('port-value-out', { async: true }),
  disabledValue: attr('number'),

  getValue() {

    if (!this.get('isEnabled')) {
      return this.get('disabledValue');
    }

    // sum all input values but leave the result as null if all inputs are null
    let value = null;
    let totalValue = null;
    this.get('connections').forEach((port) => {
      value = parseInt(port.getValue());
      if (!isNaN(value)) {
        if (totalValue == null) {
          totalValue = 0;
        }
        totalValue += value;
      }
    });
    return totalValue;
  },

  onDisabledValueChanged: observer('disabledValue', function() {
    if (this.get('hasDirtyAttributes') && !this.get('isNew')) {
      console.log('port-value-in disabledValueChanged');
      this.requestSave();
    }
  })

});
