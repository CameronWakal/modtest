import Module from '../module/model';
import { belongsTo } from '@ember-data/model';

/*  This module accepts a number of event and value inputs, and a single 'switch' value input.
 *  The value of the switch input determines which event and value ports will be patched
 *  through to the outputs. The number of input ports can be configured via a module setting.
 */

export default class ModuleSwitchModel extends Module {
  type = 'module-switch'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Switch';

  @belongsTo('port-value-in', { async: false, inverse: null }) switchInPort;
  @belongsTo('port-event-out', { async: false, inverse: null }) eventOutPort;
  @belongsTo('port-group', { async: false, inverse: null }) inputPortsGroup;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    if (this.isNew && this.ports.length === 0) {
      this.title = this.name;

      this.addNumberSetting('input sets', 'inputPortsGroup.portSetsCount', this, { minValue: 1, maxValue: 4 });

      this.addValueInPort('switch', 'switchInPort', { canBeEmpty: true });

      // add an expandable group of input ports
      let inputPorts = this.addPortGroup({ minSets: 1, maxSets: 4 });
      this.inputPortsGroup = inputPorts;

      // add one valueInPort and one eventInPort to the group
      this.addValueInPortWithoutAssignment('0', { canBeEmpty: true });
      this.addEventInPort('0', 'onEventIn', true);

      inputPorts.portSetsCount = 2;

      this.addPortGroup();
      this.addValueOutPort('out', 'getValue', true);
      this.addEventOutPort('out', 'eventOutPort', true);
    }
  }

  getValue() {
    let switchVal = this.switchInPort.getValue();
    if (switchVal == null) {
      return null;
    }
    let ports = this.inputPortsGroup?.valueInPorts;
    let port = ports?.at(switchVal);
    if (port == null) {
      return null;
    }
    return port.getValue();
  }

  onEventIn(event, port) {
    let switchVal = this.switchInPort.getValue();
    let portNumber = parseInt(port.label);
    if (switchVal != null && !isNaN(portNumber)) {
      if (switchVal == portNumber) {
        this.eventOutPort.sendEvent(event);
      }
    }
  }
}
