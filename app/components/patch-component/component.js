import Ember from 'ember';

const {
  Component,
  computed,
  run,
  get,
  set
} = Ember;

export default Component.extend({
  classNames: ['patch'],

  classNameBindings: ['newConnectionClass'],

  diagramNeedsUpdate: true,
  // css class to tell ports which type can accept the current pending connection
  newConnectionClass: computed('connectingFromPort', function() {
    let port = get(this, 'connectingFromPort');
    if (port) {
      return `new-connection new-connection-from-${get(port, 'type')}`;
    } else {
      return null;
    }
  }),

  selectedModule: null,
  movingModule: null,
  connectingFromPort: null,
  connectingToPort: null,

  didReceiveAttrs() {
    set(this, 'diagramNeedsUpdate', true);
  },

  actions: {

    removePatch() {
      this.sendAction('removePatch');
    },

    savePatch() {
      this.patch.save();
    },

    patchTitleChanged() {
      console.log('patchTitleChanged');
      this.patch.save();
    },

    moduleSelected(module) {
      set(this, 'selectedModule', module);
    },

    moduleDeselected() {
      set(this, 'selectedModule', null);
    },

    moduleStartedMoving(module) {
      set(this, 'movingModule', module);
    },

    moduleFinishedMoving() {
      set(this, 'movingModule', null);
    },

    portStartedConnecting(module, port) {
      set(this, 'connectingFromPort', port);
    },

    // if there is a toPort and fromPort when finished, make the connection!
    portFinishedConnecting() {
      if (get(this, 'connectingToPort')) {
        this.addConnection(get(this, 'connectingFromPort'), get(this, 'connectingToPort'));
      }
      set(this, 'connectingFromPort', null);
      set(this, 'connectingToPort', null);
    },

    portDisconnected() {
      set(this, 'diagramNeedsUpdate', true);
    },

    modulePortsChanged() {
      set(this, 'diagramNeedsUpdate', true);
    },

    moduleLayoutChanged() {
      set(this, 'diagramNeedsUpdate', true);
    },

    mouseEnterPort(toPort) {
      let fromPort = get(this, 'connectingFromPort');
      if (fromPort) { // we're dragging to create a new connection
        if (get(toPort, 'type') === get(fromPort, 'compatibleType')) { // we mouseEntered a compatible port type
          if (!get(fromPort, 'connections').findBy('id', toPort.id)) { // the two ports aren't already connected
            set(this, 'connectingToPort', toPort);
          }
        }
      }
    },

    mouseLeavePort() {
      set(this, 'connectingToPort', null);
    },

    // diagram shit

    diagramDidUpdate() {
      run.scheduleOnce('afterRender', this, function() {
        set(this, 'diagramNeedsUpdate', false);
      });
    },

    // module management

    removeModule(module) {
      get(this, 'patch.modules').removeObject(module);
      this.patch.save();
      module.remove();
      set(this, 'diagramNeedsUpdate', true);

    },

    addModule(type, event) {
      let module = this.store.createRecord(`module-${type}`, { patch: this.patch, xPos: event.pageX - event.offsetX, yPos: event.pageY - event.offsetY });
      get(this, 'patch.modules').pushObject(module);
    },

    removeConnection(sourcePort, destPort) {
      get(sourcePort, 'connections').removeObject(destPort);
      console.log('patch.removeConnection() requestSave()');
      get(sourcePort, 'module').requestSave();
      get(destPort, 'connections').removeObject(sourcePort);
      console.log('patch.removeConnection() requestSave()');
      get(destPort, 'module').requestSave();

      set(this, 'diagramNeedsUpdate', true);
    }

  },

  addConnection(sourcePort, destPort) {
    get(destPort, 'connections').pushObject(sourcePort);
    console.log('patch.addConnection() requestSave()');
    get(destPort, 'module').requestSave();

    get(sourcePort, 'connections').pushObject(destPort);
    console.log('patch.addConnection() requestSave()');
    get(sourcePort, 'module').requestSave();

    set(this, 'diagramNeedsUpdate', true);

  }

});
