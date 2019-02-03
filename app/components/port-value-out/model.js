import DS from 'ember-data';
import Port from '../port/model';

const {
  hasMany,
  attr
} = DS;

export default Port.extend({

  type: 'port-value-out', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  // valueOut ports can have multiple valueIn ports as destinations
  connections: hasMany('port-value-in', { async: true }),
  // module getter method for target value
  targetMethod: attr('string'),

  getValue() {
    return this.module[this.targetMethod](this);
  },

  copy() {
    let newPort = this.store.createRecord('port-value-out', {
      label: this.label,
      targetMethod: this.targetMethod,
      isEnabled: this.isEnabled,
      portGroup: this.portGroup
    });
    newPort.save();
    return newPort;
  }

});
