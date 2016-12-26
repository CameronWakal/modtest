import DS from 'ember-data';
import Port from '../port/model';

export default Port.extend({

  type: 'port-value-out', //modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  //valueOut ports can have multiple valueIn ports as destinations
  connections: DS.hasMany('port-value-in', {async: true}),
  //module getter method for target value
  targetMethod: DS.attr('string'),

  getValue(){
    return this.get('module')[this.get('targetMethod')]();
  }

});
