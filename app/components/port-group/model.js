import { filterBy, union } from '@ember/object/computed';
import { set, observer } from '@ember/object';
import DS from 'ember-data';

const { Model, belongsTo, hasMany, attr } = DS;

export default Model.extend({

  // a port group can repeat its set of ports in a variable length series
  // eg in1, out1, in2, out2, in3, out3, would have a series length of 3.
  expansionSetsCount: attr('number', { defaultValue: 0 }),
  minSets: attr('number', { defaultValue: 0 }),
  maxSets: attr('number', { defaultValue: 0 }),

  module: belongsTo('module', { polymorphic: true, async: false }),
  basePorts: hasMany('port', { polymorphic: true, async: false }),
  expansionPorts: hasMany('port', { polymorphic: true, async: false }),
  ports: union('basePorts', 'expansionPorts'),
  enabledPorts: filterBy('ports', 'isEnabled', true),

  addPort(port) {
    this.basePorts.pushObject(port);
  },

  onExpansionPortSetsCountChanged: observer('expansionSetsCount', function() {
    console.log('expansion port sets count changed');
    if (this.hasDirtyAttributes) {
      let currentSetsCount = this.expansionPorts.length / this.basePorts.length;
      let newSetsCount = Math.min(Math.max(this.expansionSetsCount, this.minSets), this.maxSets);
      let change = newSetsCount - currentSetsCount;
      if (change > 0) {
        this._addExpansionSets(change);
      } else if (change < 0) {
        this._removeExpansionSets(change * -1);
      }
    }
  }),

  _addExpansionSets(count) {
    let setSize = this.basePorts.length;
    let currentSetsCount = this.expansionPorts.length / setSize;
    let port, basePort, basePortLabel;

    for (let i = currentSetsCount; i < currentSetsCount + count; i++) {
      for (let j = 0; j < setSize; j++) {
        basePort = this.basePorts.objectAt(j);
        basePortLabel = basePort.label.split('0')[0];
        port = basePort.copy();

        set(port, 'label', basePortLabel + (i + 1));
        this.expansionPorts.pushObject(port);
      }
    }
    this.module.requestSave();
  },

  _removeExpansionSets(count) {
    let setSize = this.basePorts.length;
    let currentSetsCount = this.expansionPorts.length / setSize;
    let port;

    for (let i = currentSetsCount; i > currentSetsCount - count; i--) {
      for (let j = 0; j < setSize; j++) {
        port = this.expansionPorts.popObject();
        port.disconnect();
        port.destroyRecord();
      }
    }
    this.module.requestSave();
  },

  save() {
    this._super({ adapterOptions: { dontPersist: true } });
  }

});
