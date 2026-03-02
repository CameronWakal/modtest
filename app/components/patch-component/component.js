import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { set, get, computed, action } from '@ember/object';

export default Component.extend({
  store: service(),

  classNames: ['patch'],
  classNameBindings: ['newConnectionClass'],

  diagramNeedsUpdate: true,
  selectedModule: null,
  movingModule: null,
  connectingFromPort: null,
  connectingToPort: null,

  // DOM element for in-element helper (replacement for ember-wormhole)
  get settingsContainer() {
    return document.getElementById('settings-container');
  },

  // css class to tell ports which type can accept the current pending connection
  newConnectionClass: computed('connectingFromPort', function() {
    let port = get(this, 'connectingFromPort');
    if (port) {
      return `new-connection new-connection-from-${get(port, 'type')}`;
    } else {
      return null;
    }
  }),

  didReceiveAttrs() {
    set(this, 'diagramNeedsUpdate', true);
  },

  didUpdateAttrs() {
    this.send('moduleDeselected');
  },

  @action
  diagramDidUpdate() {
    scheduleOnce('afterRender', this, this.diagramDoesntNeedUpdate);
  },

  @action
  removeConnection(sourcePort, destPort) {
    this.removeBusConnection(sourcePort, destPort);
    set(this, 'diagramNeedsUpdate', true);
  },

  @action
  moduleDeselected() {
    set(this, 'selectedModule', null);
  },

  @action
  // a bus connection doesn't appear in the diagram, so no update necessary
  addBusConnection(sourcePort, destPort) {
    get(destPort, 'connections').push(sourcePort);
    get(destPort, 'module').requestSave();

    get(sourcePort, 'connections').push(destPort);
    get(sourcePort, 'module').requestSave();
  },

  @action
  patchTitleChanged() {
    this.patch.save();
  },

  @action
  addModule(type, event) {
    let module = this.store.createRecord(`module-${type}`, { patch: this.patch, xPos: event.pageX - event.offsetX, yPos: event.pageY - event.offsetY });

    // In Ember Data 4.x, the relationship is already set via { patch: this.patch } in createRecord
    // We don't need to manually push to the modules array if inverse relationship is defined
    // But since inverse is null, we need to add manually
    const modules = get(this, 'patch.modules');
    if (modules.content) {
      modules.content.push(module);
    } else {
      modules.push(module);
    }
  },

  @action
  removeModule(module) {
    this.send('moduleDeselected');
    const modules = get(this, 'patch.modules');
    // Access content directly for async relationships to avoid deprecated PromiseManyArray methods
    const modulesArray = modules.content || modules;
    const moduleIndex = modulesArray.indexOf(module);
    if (moduleIndex !== -1) {
      modulesArray.splice(moduleIndex, 1);
    }
    this.patch.save();
    module.remove();
    set(this, 'diagramNeedsUpdate', true);
  },

  @action
  moduleSelected(module) {
    set(this, 'selectedModule', module);
  },

  @action
  modulePortStartedConnecting(module, port) {
    set(this, 'connectingFromPort', port);
  },

  // if there is a toPort and fromPort when finished, make the connection!
  @action
  modulePortFinishedConnecting() {
    if (get(this, 'connectingToPort')) {
      this.addConnection(get(this, 'connectingFromPort'), get(this, 'connectingToPort'));
    }
    set(this, 'connectingFromPort', null);
    set(this, 'connectingToPort', null);
  },

  @action
  moduleStartedMoving(module) {
    set(this, 'movingModule', module);
  },

  @action
  modulePortsChanged() {
    set(this, 'diagramNeedsUpdate', true);
  },

  @action
  moduleLayoutChanged() {
    set(this, 'diagramNeedsUpdate', true);
  },

  @action
  moduleFinishedMoving() {
    set(this, 'movingModule', null);
  },

  @action
  mouseEnterModulePort(toPort) {
    let fromPort = get(this, 'connectingFromPort');
    if (fromPort) { // we're dragging to create a new connection
      if (get(toPort, 'type') === get(fromPort, 'compatibleType')) { // we mouseEntered a compatible port type
        if (!get(fromPort, 'connections').find(c => c.id === toPort.id)) { // the two ports aren't already connected
          set(this, 'connectingToPort', toPort);
        }
      }
    }
  },

  @action
  mouseLeaveModulePort() {
    set(this, 'connectingToPort', null);
  },

  @action
  savePatch() {
    this.patch.save();
  },

  @action
  portDisconnected() {
    set(this, 'diagramNeedsUpdate', true);
  },

  diagramDoesntNeedUpdate() {
    set(this, 'diagramNeedsUpdate', false);
  },

  addConnection(sourcePort, destPort) {
    this.actions.addBusConnection(sourcePort, destPort);
    set(this, 'diagramNeedsUpdate', true);
  },

  // a bus connection doesn't appear in the diagram, so no update necessary
  removeBusConnection(sourcePort, destPort) {
    const sourceConnections = get(sourcePort, 'connections');
    const destIndex = sourceConnections.indexOf(destPort);
    if (destIndex !== -1) {
      sourceConnections.splice(destIndex, 1);
    }
    console.log('patch.removeConnection() requestSave()');
    get(sourcePort, 'module').requestSave();

    const destConnections = get(destPort, 'connections');
    const sourceIndex = destConnections.indexOf(sourcePort);
    if (sourceIndex !== -1) {
      destConnections.splice(sourceIndex, 1);
    }
    console.log('patch.removeConnection() requestSave()');
    get(destPort, 'module').requestSave();
  }

});
