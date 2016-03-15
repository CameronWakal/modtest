import Ember from 'ember';
import DS from 'ember-data';
import Port from './port';

export default Port.extend({
  //eventIn ports can have multiple eventOut ports as sources
  connections: DS.hasMany('port-event-out', {async: true}),
  targetMethodName: DS.attr('string'), //method to call onEvent

  targetMethod: Ember.computed('module','targetMethodName',function(){
    let module = this.get('module');
    let targetMethodName = this.get('targetMethodName');
    let targetMethod = module.get(targetMethodName).bind(module);
    return targetMethod;
  }),

});
