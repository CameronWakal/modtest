import Ember from 'ember';

export default Ember.Controller.extend({
  
  sourceModule: null,
  sourcePort: null,
  destModule: null,
  destPort: null,

  portTemplates: 
  [
    { module:'module-clock',
      ports:
      [ 
        { label:'trig',
          signal:'event',
          direction:'source'
        },
        { label:'tempo',
          signal:'value',
          direction:'destination'
        }
      ]
    },
    {
      module:'module-generic',
      ports:
      [ 
        { label:'in',
          signal:'event',
          direction:'destination'
        },
        { label:'thru',
          signal:'event',
          direction:'source'
        }
      ]
    }
  ],

  actions: {
    
    removeCurrentPatch() {
      //destroy patch, remove all modules, transition to index
      console.log('--- patchController removing patch '+this.model.id);

      let modules = this.model.get('modules');
      let modulesList = modules.toArray();

      this.model.destroyRecord();

      modulesList.forEach(function(module){
        console.log('forEach '+module);
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

      let portTemplate = this.portTemplates.findBy('module', type);

      portTemplate.ports.forEach(function(template){
        let port = this.store.createRecord('port', {  signal:template.signal,
                                                      direction:template.direction,
                                                      label:template.label,
                                                      module:module
        });
        port.save();
        module.get('ports').pushObject(port);
      }, this);

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
