import Ember from 'ember';

export default Ember.Controller.extend({
  
  sourceModule: null,
  sourcePort: null,
  destModule: null,
  destPort: null,

  actions: {
    
    removeCurrentPatch() {
      //destroy patch, remove all modules, transition to index
      console.log('--- patchController removing patch '+this.model.id);

      let modules = this.model.get('modules');

      this.model.destroyRecord();

      modules.forEach(function(module){
        this.send('removeModule', module);
      }, this);
      
      this.transitionToRoute('index');
    },

    removeModule(module) {
      //destroy all ports, remove from patch, save patch, destroy module
      console.log('--- patchController destroying ports on module '+module.id);

      module.get('ports').forEach(function(port) {
        port.destroyRecord();
      });
        
      console.log('--- patchController removing module '+module.id);

      this.model.get('modules').removeObject(module);
      this.model.save();

      console.log('--- patchController destroying module '+module.id);

      module.destroyRecord();

    },

    addModule(type) {
      let module = this.store.createRecord('module', {patch:this.model, type:type});

      if(type === 'module-clock') {
      //create ports on module model. How to save these as templates?

        let port = this.store.createRecord('port', {  signal:'event',
                                                      direction:'source',
                                                      label:'trig',
                                                      module:module
        });
        port.save();
        module.get('ports').pushObject(port);

        port = this.store.createRecord('port', {  signal:'value',
                                                      direction:'destination',
                                                      label:'tempo',
                                                      module:module
        });
        port.save();
        module.get('ports').pushObject(port);

      } else if (type === 'generic-module') {
        //no ports
      }

      module.save();
      this.model.save();

      console.log('--- patchController saved module '+module.id+' to patch '+this.model.id);
      
    },

    addConnection(sourceModule, sourcePortName, destModule, destPortName) {
      console.log('connecting '+sourceModule+'/'+sourcePortName+' to '+destModule+'/'+destPortName);
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
