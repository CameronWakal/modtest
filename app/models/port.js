import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  signal: DS.attr('string'),                              //event or value
  direction: DS.attr('string'),                           //source or destination
  label: DS.attr('string'),                               //briefly describing port use
  destinations: DS.hasMany('port', {inverse:'source'}),   //only source ports have destinations
  source: DS.belongsTo('port', {async: false}),           //only destination ports have a source
  module: DS.belongsTo('module', {polymorphic: true, async: false}),

  targetMethod: DS.attr('string'), //method to call for event destination ports
  targetVariable: DS.attr('string'), //variable to check for value source ports

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
  },

  readValue() {
    if( this.get('isEvent') ) {
      console.log("Error: can't read value of an event port");
    } else if( this.get('isSource') ) {
      return this.get('module.'+this.get('targetVariable'));
    } else {
      return this.get('source').readValue();
    }
  }

});
