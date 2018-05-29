import { set, get, observer } from '@ember/object';
import Module from '../module/model';
import DS from 'ember-data';

/*  This module accepts a number of event and value inputs.
 *  All events are passed through to the event out port, and the value that was paired
 *  with the most recent event in, is passed through to the value output. So you can
 *  use this to merge together event+value pairs from multiple sources into a single
 *  event and value output, without summing the values as a straight patch connection would.
 */

const {
  belongsTo,
  hasMany,
  attr
} = DS;

const maxInputs = 16;
const minInputs = 1;

export default Module.extend({

  type: 'module-merge-voices', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Merge Voices',

  // a value in port is selected when its counterpart event port receives an event.
  selectedValueInPort: null,

  inputPortsCount: attr('number', { defaultValue: 2 }),

  valueInPorts: hasMany('port-value-in', { async: false }),
  eventInPorts: hasMany('port-event-in', { async: false }),
  eventOutPort: belongsTo('port-event-out', { async: false }),

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

      this.addNumberSetting('Inputs', 'inputPortsCount', this, { minValue: 1, maxValue: 8 });

      this.addValueOutPort('out', 'getValue', true);
      this.addEventOutPort('out', 'eventOutPort', true);

      // add array of input ports
      this._addInputPorts(get(this, 'inputPortsCount'));

      console.log('module-merge-voices.didCreate() requestSave()');
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

      let ports = get(this, 'valueInPorts');
      this.selectedValueInPort = ports.objectAt(portNumber);

      get(this, 'eventOutPort').sendEvent(event);
    }
  }

});
