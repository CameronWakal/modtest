import { set, get, observer } from '@ember/object';
import Module from '../module/model';
import DS from 'ember-data';

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

  inputPortsCount: attr('number', { defaultValue: 2 }),

  valueInPorts: hasMany('port-value-in', { async: false }),
  eventInPorts: hasMany('port-event-in', { async: false }),
  switchInPort: belongsTo('port-value-in', { async: false }),
  eventOutPort: belongsTo('port-event-out', { async: false }),

  onImportPortsCountChanged: observer('inputPortsCount', function() {
    if (get(this, 'hasDirtyAttributes')) {
      let currentCount = get(this, 'valueInPorts.length');
      let newCount = Math.min(Math.max(get(this, 'inputPortsCount'), minInputs), maxInputs);
      let change = newCount - currentCount;
      let port;
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
      port = get(this, 'eventInPorts').popObject();
      get(this, 'ports').removeObject(port);
    }
  },

  getValue() {
    let switchVal = get(this, 'switchInPort').getValue();
    if (switchVal === 0) {
      return get(this, 'in0Port').getValue();
    } else if (switchVal === 1) {
      return get(this, 'in1Port').getValue();
    } else {
      return null;
    }
  },

  ready() {
    if (get(this, 'isNew')) {
      set(this, 'title', this.name);

      this.addNumberSetting('Inputs', 'inputPortsCount', this);

      this.addValueInPort('switch', 'switchInPort', { canBeEmpty: true });
      this.addValueOutPort('out', 'getValue', true);
      this.addEventOutPort('out', 'eventOutPort', true);

      // add array of input ports
      this._addInputPorts(get(this, 'inputPortsCount'));

      console.log('module-switch.didCreate() requestSave()');
      this.requestSave();
    }
  },

  onEventIn(event) {
    console.log('Switch received event!', event);
  }

});
