import { set, get, observer } from '@ember/object';
import Module from '../module/model';
import DS from 'ember-data';

/*  This module accepts a number of event and value inputs, and a single 'switch' value input.
 *  The value of the switch input determines which event and value ports will be patched
 *  through to the outputs. The number of input ports can be configured via a module setting.
 */

const {
  belongsTo,
  hasMany,
  attr
} = DS;

const maxInputs = 16;
const minInputs = 1;

export default Module.extend({

  type: 'module-switch', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Switch',

  switchInPort: belongsTo('port-value-in', { async: false }),
  eventOutPort: belongsTo('port-event-out', { async: false }),
  inputPortsGroup: belongsTo('port-group', { async: false }),

  onImportPortsCountChanged: observer('inputPortsCount', function() {
    if (get(this, 'hasDirtyAttributes')) {
      let currentCount = get(this, 'valueInPorts.length');
      let newCount = Math.min(Math.max(get(this, 'inputPortsCount'), minInputs), maxInputs);
      let change = newCount - currentCount;
      if (change > 0) {
        this._addInputPorts(change);
      } else if (change < 0) {
        this._removeInputPorts(change * -1);
      }
      this.requestSave();
    }
  }),

  _addInputPorts(count) {
    let port;
    let currentCount = get(this, 'valueInPorts.length');
    for (let i = 0; i < count; i++) {
      port = this.addValueInPortWithoutAssignment(currentCount + i, { canBeEmpty: true });
      get(this, 'valueInPorts').pushObject(port);
      port = this.addEventInPort(currentCount + i, 'onEventIn', true);
      get(this, 'eventInPorts').pushObject(port);
    }
  },

  _removeInputPorts(count) {
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
  },

  ready() {
    if (get(this, 'isNew')) {
      set(this, 'title', this.name);

      this.addNumberSetting('Input Mults', 'inputPortsGroup.expansionSetsCount', this, { minValue: 0, maxValue: 3 });

      this.addValueInPort('switch', 'switchInPort', { canBeEmpty: true });
      this.addValueOutPort('out', 'getValue', true);
      this.addEventOutPort('out', 'eventOutPort', true);

      // add an expandable group of input ports
      let inputPorts = this.addPortGroup({ minSets: 0, maxSets: 3 });
      set(this, 'inputPortsGroup', inputPorts);

      // add one valueInPort and one eventInPort to the group
      this.addValueInPortWithoutAssignment('0', { canBeEmpty: true });
      this.addEventInPort('0', 'onEventIn', true);

      console.log('module-switch.didCreate() requestSave()');
      this.requestSave();
    }
  },

  getValue() {
    let switchVal = get(this, 'switchInPort').getValue();
    if (switchVal == null) {
      return null;
    }
    let ports = get(this, 'valueInPorts');
    let port = ports.objectAt(switchVal);
    return port.getValue();
  },

  onEventIn(event, port) {
    let switchVal = get(this, 'switchInPort').getValue();
    let portNumber = parseInt(get(port, 'label'));
    if (switchVal != null && !isNaN(portNumber)) {
      if (switchVal == portNumber) {
        get(this, 'eventOutPort').sendEvent(event);
      }
    }
  }

});
