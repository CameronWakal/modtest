import DS from 'ember-data';
import Port from '../port/model';

const {
  hasMany,
  attr
} = DS;

export default Port.extend({

  type: 'port-event-in', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  // eventIn ports can have multiple eventOut ports as sources
  connections: hasMany('port-event-out', { async: true }),
  targetMethod: attr('string'), // method to call onEvent

  // pass the event to the targetMethod of the module
  sendEvent(event) {
    let module = this.get('module');
    let targetMethodName = this.get('targetMethod');
    let targetMethod = module.get(targetMethodName).bind(module);

    targetMethod(event);
  }

});
