import { hasMany } from '@ember-data/model';
import Port from '../port/model';

export default Port.extend({

  type: 'port-event-out', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  // eventOut ports can have multiple eventIn ports as destinations
  connections: hasMany('port-event-in', { async: true }),

  // pass the event to connected ports
  sendEvent(event) {
    this.connections.forEach((port) => {
      port.sendEvent(event);
    });
  },

  copy() {
    let newPort = this.store.createRecord('port-event-out', {
      label: this.label,
      isEnabled: this.isEnabled,
      portGroup: this.portGroup
    });
    newPort.save();
    return newPort;
  }

});
