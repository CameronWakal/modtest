import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  label: DS.attr('string'),
  module: DS.belongsTo('module', {polymorphic: true, async: false}),

  uniqueCssIdentifier: Ember.computed('id', function(){
    return 'port-'+this.id;
  }),

  signal: Ember.computed('constructor.modelName', function(){
    let modelName = this.get('constructor.modelName');
    if(modelName==='port-event-in' || modelName==='port-event-out'){
      return 'event';
    } else {
      return 'value';
    }
  }),
  
  direction: Ember.computed('constructor.modelName', function(){
    let modelName = this.get('constructor.modelName');
    if(modelName==='port-event-in' || modelName==='port-value-in'){
      return 'destination';
    } else {
      return 'source';
    }
  }),
  
  type: Ember.computed.alias('constructor.modelName'),

  isConnected: Ember.computed('connections', function() {
    return this.get('connections.length');
  }),

});
