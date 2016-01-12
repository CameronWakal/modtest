import DS from 'ember-data';
import Port from './port';

export default Port.extend({
  //valueOut ports can have multiple valueIn ports as destinations
  connections: DS.hasMany('port-value-in', {async: true}),
  //module getter method for target value
  targetMethod: DS.attr('string'),

  getValue(){
    return this.get('module')[this.get('targetMethod')]();
  },

});
