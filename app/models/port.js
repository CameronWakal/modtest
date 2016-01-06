import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  label: DS.attr('string'),
  module: DS.belongsTo('module', {polymorphic: true, async: false}),

  uniqueCssIdentifier: Ember.computed('id', function(){
    return 'port-'+this.id;
  }),
  
  type: Ember.computed.alias('constructor.modelName'),

  compatibleType: Ember.computed(function() {
    switch(this.constructor.modelName) {
      case 'port-value-in': return 'port-value-out';
      case 'port-value-out': return 'port-value-in';
      case 'port-event-out': return 'port-event-in';
      case 'port-event-in': return 'port-event-out';
    }
  }),

  isConnected: Ember.computed('connections', function() {
    return this.get('connections.length');
  }),

});
