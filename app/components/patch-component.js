import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['patch'],

  classNameBindings: ['newConnectionClass'],

  sourceModule: null,
  sourcePort: null,
  destModule: null,
  destPort: null,

  diagramNeedsUpdate: true,
  //css class to tell ports which type can accept the current pending connection
  newConnectionClass: null,

  movingModule: null,
  connectingFromPort: null,
  connectingToPort: null,
  
  patchChanged: Ember.observer('patch', function(sender, key, value, rev) {
    this.set('diagramNeedsUpdate', true);
  }),

  addConnection(sourcePort, destPort) {
    console.log('connecting '+sourcePort+' to '+destPort);

    destPort.get('connections').pushObject(sourcePort);
    destPort.get('module').save();

    sourcePort.get('connections').pushObject(destPort);
    sourcePort.get('module').save();

    this.set('diagramNeedsUpdate', true);

  },

  actions: {
    
    moduleStartedMoving(module) {
      this.set('movingModule', module);
    },

    moduleFinishedMoving() {
      this.set('movingModule', null);
    },

    portStartedConnecting(module, port, event) {
      console.log('port started connecting, compatible type:'+port.get('compatibleType'));
      this.set('connectingFromPort', port);
      this.send('setDiagramShouldDrawNewConnectionFrom', port.get('type'));
    },

    //if there is a toPort and fromPort when finished, make the connection!
    portFinishedConnecting() {
      console.log('port finished connecting');
      if(this.get('connectingToPort')) {
        this.addConnection(this.get('connectingFromPort'), this.get('connectingToPort'));
      }
      this.set('connectingFromPort', null);
      this.set('connectingToPort', null);
    },

    mouseEnterPort(toPort) {
      let fromPort = this.get('connectingFromPort');
      if(fromPort) { //we're dragging to create a new connection
        if(toPort.get('type') === fromPort.get('compatibleType')) { //we mouseEntered a compatible port type
          if(!fromPort.get('connections').findBy('id', toPort.id)) { //the two ports aren't already connected
            this.set('connectingToPort', toPort);
          }
        }
      }
    },

    mouseLeavePort() {
      console.log('patch mouseLeavePort');
      this.set('connectingToPort', null);
    },


    //diagram shit
    
    diagramDidUpdate(){
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.set('diagramNeedsUpdate', false);
      });
    },
    
    //todo: simplify and rename this thing
    setDiagramShouldDrawNewConnectionFrom(portType){
      if(portType) {
        this.set('newConnectionClass', 'new-connection new-connection-from-'+portType);
        console.log('drawing new connection from '+portType);
      } else {
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
