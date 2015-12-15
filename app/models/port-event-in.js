import DS from 'ember-data';
import Port from './port';

export default Port.extend({
  //eventIn ports can have multiple eventOut ports as sources
  connections: DS.hasMany('port-event-out', {async: true}),
  targetMethod: DS.attr('string'), //method to call onEvent

  //pass the event to the targetMethod of the module
  sendEvent(event) {
    let module = this.get('module');
    let targetMethodName = this.get('targetMethod');
    let targetMethod = module.get(targetMethodName).bind(module);

    targetMethod(event);
  },

});
