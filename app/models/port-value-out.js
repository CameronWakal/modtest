import DS from 'ember-data';
import Ember from 'ember';
import Port from './port';

export default Port.extend({
  //valueOut ports can have multiple valueIn ports as destinations
  connections: DS.hasMany('port-value-in', {async: false}),
  //module variable to check on getValue
  targetVar: DS.attr('string'),

  getValue(){
    return this.get('module.'+this.get('targetVar'));
  },

});
