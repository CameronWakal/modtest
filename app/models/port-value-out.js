import Ember from 'ember';
import DS from 'ember-data';
import Port from './port';

export default Port.extend({
  //valueOut ports can have multiple valueIn ports as destinations
  connections: DS.hasMany('port-value-in', {async: true}),
  //module getter method for target value
  targetMethod: DS.attr('string'),

  ready() {
    Ember.defineProperty(this, 'value', Ember.computed.alias('module.'+this.get('targetMethod')));
  },

  getValue(){
    return this.get('value');
  },

});
