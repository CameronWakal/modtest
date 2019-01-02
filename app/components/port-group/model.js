import { filterBy, union } from '@ember/object/computed';
import { observer } from '@ember/object';
import DS from 'ember-data';

const { Model, hasMany, attr } = DS;

export default Model.extend({

  // a port group can repeat its set of ports in a variable length series
  // eg in1, out1, in2, out2, in3, out3, would have a series length of 3.
  expansionSetsCount: attr('number', { defaultValue: 0 }),
  minSets: attr('number', {defaultValue: 0 }),
  maxSets: attr('number', {defaultValue: 0 }),

  basePorts: hasMany('port', { polymorphic: true, async: false }),
  expansionPorts: hasMany('port', { polymorphic: true, async: false }),
  ports: union('basePorts', 'expansionPorts'),
  enabledPorts: filterBy('ports', 'isEnabled', true),

  addPort(port) {
    this.basePorts.pushObject(port);
  },

  onExpansionPortSetsCountChanged: observer('expansionSetsCount', function() {
    if (this.hasDirtyAttributes) {
      let currentSetsCount = this.expansionPorts.length / this.basePorts.length;
      let newSetsCount = Math.min(Math.max(this.expansionSetsCount, this.minSets), this.maxSets);
      let change = newSetsCount - currentSetsCount;
      if (change > 0) {
        this._addExpansionSets(change);
      } else if (change < 0) {
        this._removeExpansionSets(change * -1);
      }
      this.requestSave();
    }
  }),

  _addExpansionSets(count) {
    /*
    let port;
    let currentCount = get(this, 'valueInPorts.length');
    for (let i = 0; i < count; i++) {
      port = this.addValueInPortWithoutAssignment(currentCount + i, { canBeEmpty: true });
      get(this, 'valueInPorts').pushObject(port);
      port = this.addEventInPort(currentCount + i, 'onEventIn', true);
      get(this, 'eventInPorts').pushObject(port);
    }
    */
  },

  _removeExpansionSets(count) {
    /*
    let port;
    for (let i = 0; i < count; i++) {
      port = get(this, 'valueInPorts').popObject();
      get(this, 'ports').removeObject(port);
      port.disconnect();
      port.destroyRecord();
      port = get(this, 'eventInPorts').popObject();
      get(this, 'ports').removeObject(port);
      port.disconnect();
      port.destroyRecord();
    }
    */
  },

  save() {
    this._super({ adapterOptions: { dontPersist: true } });
  }

});
