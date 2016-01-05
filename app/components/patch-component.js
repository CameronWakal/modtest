import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['patch'],

  classNameBindings: [
    'diagramShouldDrawNewConnection:new-connection', 
    'newConnectionClass',
  ],

  didInsertElement() {
    console.log('inserted patch component');
    this.set('eventManager.patchComponent', this);
  },

  sourceModule: null,
  sourcePort: null,
  destModule: null,
  destPort: null,

  diagramNeedsUpdate: true,
  diagramNeedsDraw: false,
  diagramShouldDrawNewConnection: false,
  newConnectionClass: null,

  eventManager: Ember.Object.create({

    patchComponent: null,
    movingModule: null,
    moveOffsetX: null,
    moveOffsetY: null,
    
    connectingFromPort: null,
    connectingPosX: null,
    connectingPosY: null,

    mouseMove: function(event, view) {
      event.preventDefault();
      let module = this.get('movingModule');
      if(module) {
        module.set('xPos', event.pageX - this.get('moveOffsetX') );
        module.set('yPos', event.pageY - this.get('moveOffsetY') );
        this.get('patchComponent').send('drawDiagram');
      }
      let port = this.get('connectingFromPort');
      if(port) {
        this.get('patchComponent').send('drawDiagram');
      }
    }
  }),
  
  patchChanged: Ember.observer('patch', function(sender, key, value, rev) {
    this.set('diagramNeedsUpdate', true);
    this.set('eventManager.patchComponent', this);
  }),

  actions: {
    
    moduleStartedMoving(module, event) {
      this.set('eventManager.movingModule', module);
      this.set('eventManager.moveOffsetX', event.pageX - module.get('xPos') );
      this.set('eventManager.moveOffsetY', event.pageY - module.get('yPos') );
    },

    moduleFinishedMoving() {
      //todo: will this hit the service if coordinates have not changed?
      this.get('eventManager.movingModule').save(); 
      this.set('eventManager.movingModule', null);
    },

    portStartedConnecting(module, port, event) {
      console.log('port started connecting', port, module);
      this.set('eventManager.connectingFromPort', port);
      this.send('setDiagramShouldDrawNewConnectionFrom', port.get('type'));
    },

    portFinishedConnecting() {
      console.log('port finished connecting');
      this.set('eventManager.connectingFromPort', null);
      this.send('setDiagramShouldDrawNewConnectionFrom', null);
    },


    //diagram shit

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
        this.set('newConnectionClass', 'new-connection-from-'+portType);
        console.log('drawing new connection from '+portType);
      } else {
        this.set('diagramShouldDrawNewConnection', false);
        this.set('newConnectionClass', null);
        console.log('not drawing new connection');
      }
     
    },

    //module management

    removeModule(module) {
      this.patch.get('modules').removeObject(module);
      this.patch.save();
      module.remove();
      this.set('diagramNeedsUpdate', true);

    },

    addModule(type) {
      let module = this.store.createRecord('module-'+type, { patch: this.patch });
      this.patch.get('modules').pushObject(module);
      this.patch.save();
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

  },

});
