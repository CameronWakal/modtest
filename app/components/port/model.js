import Model, { belongsTo, attr } from '@ember-data/model';

export default class PortModel extends Model {
  type = 'port'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  @attr('string') label;
  @attr('boolean', { defaultValue: true }) isEnabled;
  @belongsTo('port-group', { polymorphic: true, async: false, inverse: null }) portGroup;

  get module() {
    return this.portGroup?.module;
  }

  get isConnected() {
    return this.connections?.length > 0;
  }

  get uniqueCssIdentifier() {
    return `port-${this.id}`;
  }

  get compatibleType() {
    switch (this.type) {
      case 'port-value-in': return 'port-value-out';
      case 'port-value-out': return 'port-value-in';
      case 'port-event-out': return 'port-event-in';
      case 'port-event-in': return 'port-event-out';
    }
    return '';
  }

  get isValuePort() {
    return this.type === 'port-value-in' || this.type === 'port-value-out';
  }

  get isEventPort() {
    return this.type === 'port-event-in' || this.type === 'port-event-out';
  }

  // Remove all connections
  disconnect() {
    let connections = this.connections.slice();
    connections.forEach((connection) => {
      const connConnections = connection.connections;
      const index = connConnections.indexOf(this);
      if (index !== -1) {
        connConnections.splice(index, 1);
      }
      connection.save();
    }, this);
  }

}
