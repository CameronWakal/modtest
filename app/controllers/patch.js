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
        this.removeModule(module);
      }, this);
      this.transitionToRoute('index');
    },

    removeModule(module) {
      this.model.get('modules').removeObject(module);
      this.model.save();
      module.destroyRecord();
    },

    addModule(type) {
      let module = this.store.createRecord('module-'+type, { patch: this.model });
      this.model.get('modules').pushObject(module);
      module.save();
      this.model.save();
    },

    addConnection(sourcePort, destPort) {
      console.log('connecting '+sourcePort+' to '+destPort);

      if(!sourcePort || !destPort) {
        console.log('Select a source and destination port before adding a connection.');
      } else if(sourcePort.get('signal') !== destPort.get('signal')) {
        console.log('Ports must have the same signal type in order to connect.');
      } else {

        let currentSource = destPort.get('source');

        if(currentSource !== null) {
          console.log('removing current source:'+currentSource);
          currentSource.get('destinations').removeObject(destPort);
          currentSource.save();
        }

        destPort.set('source', sourcePort);
        destPort.save();

        sourcePort.get('destinations').pushObject(destPort);
        sourcePort.save();

      }

    },

    removeConnection(destPort) {
      console.log('--- patchController removing connection from destPort '+destPort);
      let sourcePort = destPort.get('source');
      sourcePort.get('destinations').removeObject(destPort);
      sourcePort.save();
      destPort.set('source', null);
      destPort.save();
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
