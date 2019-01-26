import DS from 'ember-data';
import Port from '../port/model';

const {
  hasMany
} = DS;

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
      module: this.module
    });
    newPort.save();
    return newPort;
  },

});
