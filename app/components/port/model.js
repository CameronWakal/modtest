import { bool, alias } from '@ember/object/computed';
import { get, observer, computed } from '@ember/object';
import DS from 'ember-data';
import { isEmpty } from '@ember/utils';

const {
  Model,
  attr,
  belongsTo
} = DS;

export default Model.extend({
  type: 'port', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  label: attr('string'),
  isEnabled: attr('boolean', { defaultValue: true }),
  module: belongsTo('module', { polymorphic: true, async: false }),

  isConnected: bool('connections.length'),

  uniqueCssIdentifier: computed('id', function() {
    return `port-${this.id}`;
  }),

  compatibleType: computed(function() {
    switch (get(this, 'type')) {
      case 'port-value-in': return 'port-value-out';
      case 'port-value-out': return 'port-value-in';
      case 'port-event-out': return 'port-event-in';
      case 'port-event-in': return 'port-event-out';
    }
  }),

  isValuePort: computed('type', function() {
    return get(this, 'type') === 'port-value-in' || get(this, 'type') === 'port-value-out';
  }),
  isEventPort: computed('type', function() {
    return get(this, 'type') === 'port-event-in' || get(this, 'type') === 'port-event-out';
  }),

  onAttrChanged: observer('isEnabled', 'label', function() {
    if (get(this, 'hasDirtyAttributes') && !get(this, 'isNew')) {
      console.log('port attrchanged');
      this.requestSave();
    }
  }),

  // clear all connections when enabling or disabling
  // connections must be cleared when enabling in case the port
  // is connected to a bus
  onEnabledChanged: observer('isEnabled', function() {
    console.log('onEnabledChanged');
    if (!isEmpty(get(this, 'connections'))) {
      this.disconnect();
    }
  }),

  // remove all connections
  disconnect() {
    let connections = get(this, 'connections').toArray();
    connections.forEach((connection) => {
      get(connection, 'connections').removeObject(this);
      console.log('port.disconnect() requestSave()');
      get(connection, 'module').requestSave();
    }, this);
  },

  save() {
    this._super({ adapterOptions: { dontPersist: true } });
  },

  requestSave() {
    get(this, 'module').requestSave();
  }

});
