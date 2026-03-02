import { set, get, computed } from '@ember/object';
import Module from '../module/model';
import { belongsTo } from '@ember-data/model';

/*  This module accepts a number of event and value inputs.
 *  All events are passed through to the event out port, and the value that was paired
 *  with the most recent event in, is passed through to the value output. So you can
 *  use this to merge together event+value pairs from multiple sources into a single
 *  event and value output, without summing the values as a straight patch connection would.
 */

export default Module.extend({

  type: 'module-merge-voices', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Merge Voices',

  // a value in port is selected when its counterpart event port receives an event.
  selectedValueInPort: null,

  inputPortsGroup: belongsTo('port-group', { async: false, inverse: null }),
  eventOutPort: belongsTo('port-event-out', { async: false, inverse: null }),

  // Get numbered ports from the input port group, sorted by label
  numberedValueInPorts: computed('inputPortsGroup.valueInPorts.@each.label', function() {
    if (!this.inputPortsGroup) return [];
    return this.inputPortsGroup.valueInPorts
      .slice()
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }),

  numberedEventInPorts: computed('inputPortsGroup.eventInPorts.@each.label', function() {
    if (!this.inputPortsGroup) return [];
    return this.inputPortsGroup.eventInPorts
      .slice()
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }),

  init() {
    this._super(...arguments);
    if (this.isNew && this.ports.length === 0) {
      set(this, 'title', this.name);

      // Output ports in the default port group
      this.addValueOutPort('out', 'getValue', true);
      this.addEventOutPort('out', 'eventOutPort', true);

      // Expandable input port group
      let inputGroup = this.addPortGroup({ minSets: 1, maxSets: 8 });
      set(this, 'inputPortsGroup', inputGroup);

      // Base input ports (labeled '0', expansion will be '1', '2', etc.)
      this.addValueInPortWithoutAssignment('0', { canBeEmpty: true });
      this.addEventInPort('0', 'onEventIn', true);

      // Setting to control number of input pairs
      this.addNumberSetting('Inputs', 'inputPortsGroup.portSetsCount', this, { minValue: 1, maxValue: 8 });
      set(inputGroup, 'portSetsCount', 2);

      this.requestSave();
    }
  },

  getValue() {
    if (this.selectedValueInPort) {
      return this.selectedValueInPort.getValue();
    }
    return null;
  },

  onEventIn(event, port) {
    let portNumber = parseInt(get(port, 'label'));
    if (!isNaN(portNumber)) {
      let ports = this.numberedValueInPorts;
      this.selectedValueInPort = ports[portNumber];

      if (this.eventOutPort) {
        this.eventOutPort.sendEvent(event);
      }
    }
  }

});
