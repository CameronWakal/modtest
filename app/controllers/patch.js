import Ember from 'ember';

export default Ember.Controller.extend({
  
  sourceModule: null,
  sourcePort: null,
  destModule: null,
  destPort: null,

  actions: {
    
    removePatch() {
      console.log('--- patchController removing patch '+this.model.id);

      let modules = this.model.get('modules');

      modules.forEach(function(module){
        module.get('ports').forEach(function(port) {
          port.destroyRecord();
        });
        module.destroyRecord();
      });

      this.model.destroyRecord();
      this.transitionToRoute('index');
    },
    
    removeModule(module) {
      console.log('--- patchController for '+this.model.id+' removing module '+module.id);

      module.get('ports').forEach(function(port) {
        port.destroyRecord();
      });

      this.model.get('modules').removeObject(module);
      this.model.save();
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
    },

    addConnection(sourceModule, sourcePortName, destModule, destPortName) {
      console.log('connecting '+sourceModule+'/'+sourcePortName+' to '+destModule+'/'+destPortName);
    },

    selectModulePort(module, port) {
      console.log('--- patchController selecting module '+module.get('type')+' port '+port.get('name'));

      if(port.portType === 'source') {
        this.set('sourceModule', module);
        this.set('sourcePort', port);
      } else if(port.portType === 'dest') {
        this.set('destModule', module);
        this.set('destPort', port);
      }
      
    }

  }
});
