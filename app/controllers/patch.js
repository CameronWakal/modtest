import Ember from 'ember';

export default Ember.Controller.extend({

  sourceModule: null,
  sourcePort: null,
  destModule: null,
  destPort: null,

  diagramNeedsUpdate: false,
  diagramNeedsDraw: false,
  diagramShouldDrawNewConnection: false,
  newConnectionClass: null,

  modelChanged: Ember.observer('model', function(sender, key, value, rev) {
    this.set('diagramNeedsUpdate', true);
  }),

  actions: {
    
    drawDiagram(){
      this.set('diagramNeedsDraw', true);
    },

    diagramDidUpdate(){
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.set('diagramNeedsUpdate', false);
      });
    },

    diagramDidDraw(){
        this.set('diagramNeedsDraw', false);
    },

    setDiagramShouldDrawNewConnectionFrom(portType){
      if(portType) {
        this.set('diagramShouldDrawNewConnection', true);
        this.set('newConnectionClass', 'new-connection new-connection-from-'+portType);
        console.log('drawing new connection from '+portType);
      } else {
        this.set('diagramShouldDrawNewConnection', false);
        this.set('newConnectionClass', null);
        console.log('not drawing new connection');
      }
     
    },

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
      this.set('diagramNeedsUpdate', true);

    },

    addModule(type) {
      let module = this.store.createRecord('module-'+type, { patch: this.model });
      this.model.get('modules').pushObject(module);
      this.model.save();
      module.save();
    },

    addConnection(sourcePort, destPort) {
      console.log('connecting '+sourcePort+' to '+destPort);

      //todo: check if connection already exists

      destPort.get('connections').pushObject(sourcePort);
      destPort.get('module').save();

      sourcePort.get('connections').pushObject(destPort);
      sourcePort.get('module').save();

      this.set('diagramNeedsUpdate', true);

    },

    removeConnection(sourcePort, destPort) {
      console.log('--- patchController removing connection between '+sourcePort+' and '+destPort);
      console.log('NOT IMPLEMENTED');

      this.set('diagramNeedsUpdate', true);
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
      
    },

  }
});
