import { set, get } from '@ember/object';
import Module from '../module/model';
import DS from 'ember-data';

/*  This module accepts a number of event and value inputs, and a single 'switch' value input.
 *  The value of the switch input determines which event and value ports will be patched
 *  through to the outputs. The number of input ports can be configured via a module setting.
 */

const {
  belongsTo
} = DS;

export default Module.extend({

  type: 'module-switch', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Switch',

  switchInPort: belongsTo('port-value-in', { async: false }),
  eventOutPort: belongsTo('port-event-out', { async: false }),
  inputPortsGroup: belongsTo('port-group', { async: false }),

  init() {
    this._super(...arguments);
    if (get(this, 'isNew')) {
      set(this, 'title', this.name);

      this.addNumberSetting('input sets', 'inputPortsGroup.portSetsCount', this, { minValue: 1, maxValue: 4 });

      this.addValueInPort('switch', 'switchInPort', { canBeEmpty: true });

      // add an expandable group of input ports
      let inputPorts = this.addPortGroup({ minSets: 1, maxSets: 4 });
      set(this, 'inputPortsGroup', inputPorts);

      // add one valueInPort and one eventInPort to the group
      this.addValueInPortWithoutAssignment('0', { canBeEmpty: true });
      this.addEventInPort('0', 'onEventIn', true);

      set(inputPorts, 'portSetsCount', 2);

      this.addPortGroup();
      this.addValueOutPort('out', 'getValue', true);
      this.addEventOutPort('out', 'eventOutPort', true);

      console.log('module-switch.didCreate() requestSave()');
      this.requestSave();
    }
  },

  getValue() {
    let switchVal = get(this, 'switchInPort').getValue();
    if (switchVal == null) {
      return null;
    }
    let ports = get(this, 'inputPortsGroup.valueInPorts');
    let port = ports.objectAt(switchVal);
    if (port == null) {
      return null;
    }
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
