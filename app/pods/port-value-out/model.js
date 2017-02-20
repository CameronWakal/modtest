import DS from 'ember-data';
import Port from '../port/model';
import Ember from 'ember';

const {
  hasMany,
  attr
} = DS;

const {
  get
} = Ember;

export default Port.extend({

  type: 'port-value-out', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  // valueOut ports can have multiple valueIn ports as destinations
  connections: hasMany('port-value-in', { async: true }),
  // module getter method for target value
  targetMethod: attr('string'),

  getValue() {
    return get(this, 'module')[get(this, 'targetMethod')]();
  }

});
