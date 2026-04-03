import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { addObserver } from '@ember/object/observers';
import { notifyPropertyChange } from '@ember/object';

export default class PortGroupModel extends Model {
  // A port group can repeat its set of ports in a variable length series
  // eg in1, out1, in2, out2, in3, out3, would have a series length of 3.
  @attr('number', { defaultValue: 1 }) portSetsCount;
  @attr('number', { defaultValue: 0 }) minSets;
  @attr('number', { defaultValue: 0 }) maxSets;

  @belongsTo('module', { polymorphic: true, async: false, inverse: null }) module;
  @hasMany('port', { polymorphic: true, async: false, inverse: null }) basePorts;
  @hasMany('port', { polymorphic: true, async: false, inverse: null }) expansionPorts;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    addObserver(this, 'portSetsCount', this._portSetsCountChanged);
  }

  get ports() {
    return [...this.basePorts.slice(), ...this.expansionPorts.slice()];
  }

  get eventOutPorts() {
    return this.ports.filter(p => p.type === 'port-event-out');
  }

  get eventInPorts() {
    return this.ports.filter(p => p.type === 'port-event-in');
  }

  get valueOutPorts() {
    return this.ports.filter(p => p.type === 'port-value-out');
  }

  get valueInPorts() {
    return this.ports.filter(p => p.type === 'port-value-in');
  }

  get enabledPorts() {
    return this.ports.filter(p => p.isEnabled);
  }

  addPort(port) {
    this.basePorts.push(port);
    // Notify that ports changed so dependent computed properties update
    notifyPropertyChange(this, 'basePorts');
  }

  _portSetsCountChanged() {
    this._syncExpansionSets();
  }

  _syncExpansionSets() {
    let currentSetsCount = (this.expansionPorts.length / this.basePorts.length) + 1;
    let newSetsCount = Math.min(Math.max(this.portSetsCount, this.minSets), this.maxSets);
    let change = newSetsCount - currentSetsCount;
    if (change > 0) {
      this._addExpansionSets(change);
    } else if (change < 0) {
      this._removeExpansionSets(change * -1);
    }
  }

  _addExpansionSets(count) {
    let setSize = this.basePorts.length;
    let currentSetsCount = (this.expansionPorts.length / setSize) + 1;
    let port, basePort, basePortLabel;

    for (let i = currentSetsCount; i < currentSetsCount + count; i++) {
      for (let j = 0; j < setSize; j++) {
        basePort = this.basePorts.at(j);
        basePortLabel = basePort.label.split('0')[0];
        port = basePort.copy();

        port.label = basePortLabel + i;
        this.expansionPorts.push(port);
      }
    }
    // Notify that ports changed so dependent computed properties update
    notifyPropertyChange(this, 'expansionPorts');
  }

  _removeExpansionSets(count) {
    let setSize = this.basePorts.length;
    let currentSetsCount = (this.expansionPorts.length / setSize) + 1;
    let port;

    for (let i = currentSetsCount; i > currentSetsCount - count; i--) {
      for (let j = 0; j < setSize; j++) {
        port = this.expansionPorts.pop();
        port.disconnect();
        this.store.unloadRecord(port);
      }
    }
    // Notify that ports changed so dependent computed properties update
    notifyPropertyChange(this, 'expansionPorts');
  }

}
