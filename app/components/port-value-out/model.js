import { hasMany, attr } from '@ember-data/model';
import Port from '../port/model';

export default class PortValueOutModel extends Port {
  type = 'port-value-out'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  // valueOut ports can have multiple valueIn ports as destinations
  @hasMany('port-value-in', { async: false, inverse: 'connections' }) connections;
  // Module getter method for target value
  @attr('string') targetMethod;

  getValue() {
    return this.module[this.targetMethod](this);
  }

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
}
