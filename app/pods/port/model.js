import DS from 'ember-data';
import Ember from 'ember';

const {
  computed,
  observer
} = Ember;

const {
  Model,
  attr,
  belongsTo
} = DS;

export default Model.extend({
  label: attr('string'),
  isEnabled: attr('boolean', { defaultValue: true }),
  module: belongsTo('module', { polymorphic: true, async: false }),

  uniqueCssIdentifier: computed('id', function() {
    return `port-${this.id}`;
  }),

  type: 'port', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  compatibleType: computed(function() {
    switch (this.get('type')) {
      case 'port-value-in': return 'port-value-out';
      case 'port-value-out': return 'port-value-in';
      case 'port-event-out': return 'port-event-in';
      case 'port-event-in': return 'port-event-out';
    }
  }),

  isValuePort: computed('type', function() {
    return this.get('type') === 'port-value-in' || this.get('type') === 'port-value-out';
  }),
  isEventPort: computed('type', function() {
    return this.get('type') === 'port-event-in' || this.get('type') === 'port-event-out';
  }),

  isConnected: computed.bool('connections.length'),

  // remove all connections
  disconnect() {
    let connections = this.get('connections').toArray();
    connections.forEach((connection) => {
      connection.get('connections').removeObject(this);
      console.log('port.disconnect() requestSave()');
      connection.get('module').requestSave();
    }, this);
  },

  save() {
    this._super({ adapterOptions: { dontPersist: true } });
  },

  requestSave() {
    this.get('module').requestSave();
  },

  onAttrChanged: observer('isEnabled', 'label', function() {
    if (this.get('hasDirtyAttributes') && !this.get('isNew')) {
      console.log('port attrchanged');
      this.requestSave();
    }
  })

});
