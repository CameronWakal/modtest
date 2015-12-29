import Ember from 'ember';

export default Ember.Controller.extend({

  sourceModule: null,
  sourcePort: null,
  destModule: null,
  destPort: null,

  actions: {
    
    removeCurrentPatch() {
      let modules = this.model.get('modules');
      let modulesList = modules.toArray();
      this.model.destroyRecord();
      modulesList.forEach(function(module){
        module.destroyRecord();
      });
      this.transitionToRoute('index');
    },

    removeModule(module) {
      this.model.get('modules').removeObject(module);
      this.model.save();
      module.remove();
      this.model.set('portsChanged', true);

    },

    addModule(type) {
      let module = this.store.createRecord('module-'+type, { patch: this.model });
      this.model.get('modules').pushObject(module);
      module.save();
      this.model.save();
    },

    addConnection(sourcePort, destPort) {
      console.log('connecting '+sourcePort+' to '+destPort);

      //todo: check if connection already exists

      destPort.get('connections').pushObject(sourcePort);
      destPort.save();

      sourcePort.get('connections').pushObject(destPort);
      sourcePort.save();

      this.model.set('portsChanged', true);

    },

    removeConnection(sourcePort, destPort) {
      console.log('--- patchController removing connection between '+sourcePort+' and '+destPort);
      console.log('NOT IMPLEMENTED');

      this.model.set('portsChanged', true);
    },

    selectModulePort(module, port) {
      console.log('--- patchController selecting module '+module.get('type')+' port '+port.get('label'));

      let direction = port.get('direction');

      if(direction === 'source') {
        this.set('sourceModule', module);
        this.set('sourcePort', port);
      } else if(direction === 'destination') {
        this.set('destModule', module);
        this.set('destPort', port);
      }
      
    }

  }
});
