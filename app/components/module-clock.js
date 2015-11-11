import ModuleGenericComponent from './module-generic';
import Port from '../custom_objects/port';


export default ModuleGenericComponent.extend({

  ports: [
    Port.create({ signalType:'trigger', portType:'source', name:'Trigger Out'}),
    Port.create({ signalType:'signal', portType:'source', name:'Tempo Out'}),
  ],



});
