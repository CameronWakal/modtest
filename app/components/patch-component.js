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

  movingModule: null,
  connectingFromPort: null,
  connectingToPort: null,
  
  patchChanged: Ember.observer('patch', function(sender, key, value, rev) {
    this.set('diagramNeedsUpdate', true);
  }),

  actions: {
    
    moduleStartedMoving(module) {
      this.set('movingModule', module);
    },

    moduleFinishedMoving() {
      this.set('movingModule', null);
    },

    portStartedConnecting(module, port, event) {
      console.log('port started connecting');
      this.set('connectingFromPort', port);
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
      
      sourcePort.get('connections').removeObject(destPort);
      sourcePort.get('module').save();
      destPort.get('connections').removeObject(sourcePort);
      destPort.get('module').save();

      this.set('diagramNeedsUpdate', true);
    },

  },

  addConnection(sourcePort, destPort) {
    console.log('connecting '+sourcePort+' to '+destPort);

    destPort.get('connections').pushObject(sourcePort);
    destPort.get('module').save();

    sourcePort.get('connections').pushObject(destPort);
    sourcePort.get('module').save();

    this.set('diagramNeedsUpdate', true);

  },

});
