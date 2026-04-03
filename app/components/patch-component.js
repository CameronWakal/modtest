import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { action } from '@ember/object';

export default class PatchComponentComponent extends Component {
  @service store;

  @tracked diagramNeedsUpdate = true;
  @tracked selectedModule = null;
  @tracked movingModule = null;
  @tracked connectingFromPort = null;
  @tracked connectingToPort = null;

  // Track the previous patch to detect changes
  _previousPatch = null;

  // DOM element for in-element helper (replacement for ember-wormhole)
  get settingsContainer() {
    return document.getElementById('settings-container');
  }

  // css class to tell ports which type can accept the current pending connection
  get newConnectionClass() {
    let port = this.connectingFromPort;
    if (port) {
      return `new-connection new-connection-from-${port.type}`;
    } else {
      return null;
    }
  }

  get patch() {
    // When patch changes, reset state and mark diagram for update
    if (this.args.patch !== this._previousPatch) {
      // eslint-disable-next-line ember/no-side-effects
      this._previousPatch = this.args.patch;
      // Schedule state reset for after this render cycle
      scheduleOnce('afterRender', this, this._onPatchChanged);
    }
    return this.args.patch;
  }

  _onPatchChanged() {
    this.diagramNeedsUpdate = true;
    this.selectedModule = null;
  }

  @action
  diagramDidUpdate() {
    scheduleOnce('afterRender', this, this._diagramDoesntNeedUpdate);
  }

  _diagramDoesntNeedUpdate() {
    this.diagramNeedsUpdate = false;
  }

  @action
  removeConnection(sourcePort, destPort) {
    this._removeBusConnection(sourcePort, destPort);
    this.diagramNeedsUpdate = true;
  }

  @action
  moduleDeselected() {
    this.selectedModule = null;
  }

  @action
  addBusConnection(sourcePort, destPort) {
    // a bus connection doesn't appear in the diagram, so no update necessary
    destPort.connections.push(sourcePort);
    sourcePort.connections.push(destPort);
    destPort.save();
  }

  @action
  patchTitleChanged() {
    this.args.patch.save();
  }

  @action
  addModule(type, event) {
    let module = this.store.createRecord(`module-${type}`, {
      patch: this.args.patch,
      xPos: event.pageX - event.offsetX,
      yPos: event.pageY - event.offsetY
    });

    // In Ember Data 4.x, the relationship is already set via { patch: this.patch } in createRecord
    // We don't need to manually push to the modules array if inverse relationship is defined
    // But since inverse is null, we need to add manually
    const modules = this.args.patch.modules;
    if (modules.content) {
      modules.content.push(module);
    } else {
      modules.push(module);
    }
  }

  @action
  removeModule(module) {
    this.moduleDeselected();
    const modules = this.args.patch.modules;
    // Access content directly for async relationships to avoid deprecated PromiseManyArray methods
    const modulesArray = modules.content || modules;
    const moduleIndex = modulesArray.indexOf(module);
    if (moduleIndex !== -1) {
      modulesArray.splice(moduleIndex, 1);
    }
    this.args.patch.save();
    module.remove();
    this.diagramNeedsUpdate = true;
  }

  @action
  moduleSelected(module) {
    this.selectedModule = module;
  }

  @action
  modulePortStartedConnecting(module, port) {
    this.connectingFromPort = port;
  }

  @action
  modulePortFinishedConnecting() {
    // if there is a toPort and fromPort when finished, make the connection!
    if (this.connectingToPort) {
      this._addConnection(this.connectingFromPort, this.connectingToPort);
    }
    this.connectingFromPort = null;
    this.connectingToPort = null;
  }

  @action
  moduleStartedMoving(module) {
    this.movingModule = module;
  }

  @action
  modulePortsChanged() {
    this.diagramNeedsUpdate = true;
  }

  @action
  moduleLayoutChanged() {
    this.diagramNeedsUpdate = true;
  }

  @action
  moduleFinishedMoving() {
    this.movingModule = null;
  }

  @action
  mouseEnterModulePort(toPort) {
    let fromPort = this.connectingFromPort;
    if (fromPort) { // we're dragging to create a new connection
      if (toPort.type === fromPort.compatibleType) { // we mouseEntered a compatible port type
        if (!fromPort.connections.find(c => c.id === toPort.id)) { // the two ports aren't already connected
          this.connectingToPort = toPort;
        }
      }
    }
  }

  @action
  mouseLeaveModulePort() {
    this.connectingToPort = null;
  }

  @action
  savePatch() {
    this.args.patch.save();
  }

  @action
  portDisconnected() {
    this.diagramNeedsUpdate = true;
  }

  _addConnection(sourcePort, destPort) {
    this.addBusConnection(sourcePort, destPort);
    this.diagramNeedsUpdate = true;
  }

  _removeBusConnection(sourcePort, destPort) {
    // a bus connection doesn't appear in the diagram, so no update necessary
    const sourceConnections = sourcePort.connections;
    const destIndex = sourceConnections.indexOf(destPort);
    if (destIndex !== -1) {
      sourceConnections.splice(destIndex, 1);
    }

    const destConnections = destPort.connections;
    const sourceIndex = destConnections.indexOf(sourcePort);
    if (sourceIndex !== -1) {
      destConnections.splice(sourceIndex, 1);
    }
    destPort.save();
  }
}
