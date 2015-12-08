import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  label: DS.attr('string'),                               //briefly describing port use
  destinations: DS.hasMany('port', {polymorphic:true, inverse:'source'}),   //only source ports have destinations
  source: DS.belongsTo('port', {polymorphic:true, async: false}),           //only destination ports have a source
  module: DS.belongsTo('module', {polymorphic: true, async: false}),

  targetMethod: DS.attr('string'), //method to call for event destination ports
  targetVariable: DS.attr('string'), //variable to check for value source ports

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

  value: Ember.computed('module', 'targetVariable', function(){
    //only applicable to value source ports
    return this.get('module.'+this.get('targetVariable'));
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
  isConnected: Ember.computed('isSource', 'source', 'destinations', function() {
    if(this.get('isSource')) {
      return this.get('destinations').get('firstObject');
    } else {
        return this.get('source') !== null;
    }
  }),

  //todo: pretty sure these can be made simpler with computed properties

  sendEvent(event) {
    let module = this.get('module');
    let targetMethodName = this.get('targetMethod');
    let targetMethod = module.get(targetMethodName).bind(module);

    targetMethod(event);
  }

});
