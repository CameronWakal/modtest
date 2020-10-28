import { get } from '@ember/object';
import { hasMany, attr } from '@ember-data/model';
import Port from '../port/model';

export default Port.extend({

  type: 'port-event-in', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  // eventIn ports can have multiple eventOut ports as sources
  connections: hasMany('port-event-out', { async: true }),
  targetMethod: attr('string'), // method to call onEvent

  // pass the event to the targetMethod of the module
  sendEvent(event) {
    let targetMethod = get(this.module, this.targetMethod).bind(this.module);
    targetMethod(event, this);
  },

  copy() {
    let newPort = this.store.createRecord('port-event-in', {
      label: this.label,
      targetMethod: this.targetMethod,
      isEnabled: this.isEnabled,
      portGroup: this.portGroup
    });
    newPort.save();
    return newPort;
  }

});
