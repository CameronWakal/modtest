import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  label: DS.attr('string'),
  module: DS.belongsTo('module', {polymorphic: true, async: false}),

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

  isSource: Ember.computed('direction', function() {
    return this.get('direction') === 'source';
  }),
  isDestination: Ember.computed('direction', function() {
    return this.get('direction') === 'destination';
  }),
  isEvent: Ember.computed('signal', function() {
    return this.get('signal') === 'event';
  }),
  isValue: Ember.computed('direction', function() {
    return this.get('signal') === 'value';
  }),

  isConnected: Ember.computed('connections', function() {
    return this.get('connections.length');
  }),

});
