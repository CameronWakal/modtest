import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['patch'],

  classNameBindings: ['newConnectionClass'],

  diagramNeedsUpdate: true,
  //css class to tell ports which type can accept the current pending connection
  newConnectionClass: Ember.computed('connectingFromPort', function(){
    let port = this.get('connectingFromPort');
    if(port) {
      return 'new-connection new-connection-from-'+port.get('type');
    } else {
      return null;
    }
  }),

  selectedModule: null,
  movingModule: null,
  connectingFromPort: null,
  connectingToPort: null,
  
  patchChanged: Ember.observer('patch', function() {
    this.set('diagramNeedsUpdate', true);
  }),

  actions: {

    moduleSelected(module) {
      this.set('selectedModule', module);
    },

    moduleStartedMoving(module) {
      this.set('movingModule', module);
    },

    moduleFinishedMoving() {
      this.set('movingModule', null);
    },

    portStartedConnecting(module, port) {
      this.set('connectingFromPort', port);
    },

    //if there is a toPort and fromPort when finished, make the connection!
    portFinishedConnecting() {
      if(this.get('connectingToPort')) {
        this.addConnection(this.get('connectingFromPort'), this.get('connectingToPort'));
      }
      this.set('connectingFromPort', null);
      this.set('connectingToPort', null);
    },

    portDisconnected() {
      this.set('diagramNeedsUpdate', true);
    },

    modulePortsChanged() {
      this.set('diagramNeedsUpdate', true);
    },

    moduleLayoutChanged() {
      this.set('diagramNeedsUpdate', true);
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
      this.set('connectingToPort', null);
    },

    //diagram shit

    diagramDidUpdate(){
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.set('diagramNeedsUpdate', false);
      });
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
    },

    removeConnection(sourcePort, destPort) {      
      sourcePort.get('connections').removeObject(destPort);
      console.log('patch.removeConnection() requestSave()');
      sourcePort.get('module').requestSave();
      destPort.get('connections').removeObject(sourcePort);
      console.log('patch.removeConnection() requestSave()');
      destPort.get('module').requestSave();

      this.set('diagramNeedsUpdate', true);
    }

  },

  addConnection(sourcePort, destPort) {
    destPort.get('connections').pushObject(sourcePort);
    console.log('patch.addConnection() requestSave()');
    destPort.get('module').requestSave();

    sourcePort.get('connections').pushObject(destPort);
    console.log('patch.addConnection() requestSave()');
    sourcePort.get('module').requestSave();

    this.set('diagramNeedsUpdate', true);

  }

});
