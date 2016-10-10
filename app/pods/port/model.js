import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  label: DS.attr('string'),
  isEnabled: DS.attr('boolean', {defaultValue:true}),
  module: DS.belongsTo('module', {polymorphic: true, async: false}),

  uniqueCssIdentifier: Ember.computed('id', function(){
    return 'port-'+this.id;
  }),
  
  type: 'port', //modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  compatibleType: Ember.computed(function() {
    switch(this.get('type')) {
      case 'port-value-in': return 'port-value-out';
      case 'port-value-out': return 'port-value-in';
      case 'port-event-out': return 'port-event-in';
      case 'port-event-in': return 'port-event-out';
    }
  }),

  isValuePort: Ember.computed('type', function(){
    return this.get('type') === 'port-value-in' || this.get('type') === 'port-value-out';
  }),
  isEventPort: Ember.computed('type', function(){
    return this.get('type') === 'port-event-in' || this.get('type') === 'port-event-out';
  }),

  isConnected: Ember.computed.bool('connections.length'),

  //remove all connections
  disconnect() {
    let connections = this.get('connections').toArray();
    connections.forEach( connection => {
      connection.get('connections').removeObject(this);
      connection.get('module').save();
    }, this);
  },

});
