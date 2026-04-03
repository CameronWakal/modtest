import Module from '../module/model';
import { belongsTo } from '@ember-data/model';

/*  This module accepts a number of event and value inputs.
 *  All events are passed through to the event out port, and the value that was paired
 *  with the most recent event in, is passed through to the value output. So you can
 *  use this to merge together event+value pairs from multiple sources into a single
 *  event and value output, without summing the values as a straight patch connection would.
 */

export default class ModuleMergeVoicesModel extends Module {
  type = 'module-merge-voices'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Merge Voices';

  // a value in port is selected when its counterpart event port receives an event.
  selectedValueInPort = null;

  @belongsTo('port-group', { async: false, inverse: null }) inputPortsGroup;
  @belongsTo('port-event-out', { async: false, inverse: null }) eventOutPort;

  // Get numbered ports from the input port group, sorted by label
  get numberedValueInPorts() {
    if (!this.inputPortsGroup) return [];
    return this.inputPortsGroup.valueInPorts
      .slice()
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }

  get numberedEventInPorts() {
    if (!this.inputPortsGroup) return [];
    return this.inputPortsGroup.eventInPorts
      .slice()
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    if (this.isNew && this.ports.length === 0) {
      this.title = this.name;

      // Output ports in the default port group
      this.addValueOutPort('out', 'getValue', true);
      this.addEventOutPort('out', 'eventOutPort', true);

      // Expandable input port group
      let inputGroup = this.addPortGroup({ minSets: 1, maxSets: 8 });
      this.inputPortsGroup = inputGroup;

      // Base input ports (labeled '0', expansion will be '1', '2', etc.)
      this.addValueInPortWithoutAssignment('0', { canBeEmpty: true });
      this.addEventInPort('0', 'onEventIn', true);

      // Setting to control number of input pairs
      this.addNumberSetting('Inputs', 'inputPortsGroup.portSetsCount', this, { minValue: 1, maxValue: 8 });
      inputGroup.portSetsCount = 2;
    }
  }

  getValue() {
    if (this.selectedValueInPort) {
      return this.selectedValueInPort.getValue();
    }
    return null;
  }

  onEventIn(event, port) {
    let portNumber = parseInt(port.label);
    if (!isNaN(portNumber)) {
      let ports = this.numberedValueInPorts;
      this.selectedValueInPort = ports[portNumber];

      if (this.eventOutPort) {
        this.eventOutPort.sendEvent(event);
      }
    }
  }
}
