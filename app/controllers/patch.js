import Ember from 'ember';

export default Ember.Controller.extend({

  sourceModule: null,
  sourcePort: null,
  destModule: null,
  destPort: null,

  portTemplates: 
  [
    { module:'clock',
      ports:
      [ 
        { label:'trig',
          signal:'event',
          direction:'source'
        }
      ]
    },
    { module:'out',
      ports:
      [ 
        { label:'trig',
          signal:'event',
          direction:'destination'
        },
        { label:'note',
          signal:'value',
          direction:'destination'
        }
      ]
    },
    {
      module:'sequence',
      ports:
      [ 
        { label:'inc step',
          signal:'event',
          direction:'destination'
        },
        { label:'value',
          signal:'value',
          direction:'source'
        },
        { label:'trig',
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
      //module model contains info on ports and connections.
      //internal module model contains data specific to the module type.
      let module = this.store.createRecord('module-'+type, { patch: this.model });
      this.model.get('modules').pushObject(module);
      
      //create port models and attach to module, based on configuration presets 
      
      let portTemplate = this.portTemplates.findBy('module', type);
      portTemplate.ports.forEach(function(template){
        let port = this.store.createRecord('port', {
          signal:template.signal,
          direction:template.direction,
          label:template.label,
          module:module
        });
        port.save();
        module.get('ports').pushObject(port);
      }, this);

      //save module
      module.save();
      this.model.save();

      console.log('--- patchController saved module '+module.id+' to patch '+this.model.id);
      
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
