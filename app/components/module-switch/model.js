import { set, get } from '@ember/object';
import Module from '../module/model';
import DS from 'ember-data';

const {
  belongsTo,
  hasMany,
  attr
} = DS;

export default Module.extend({

  type: 'module-switch', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Switch',

  inputPortsCount: attr('number', { defaultValue: 2 }),

  valueInPorts: hasMany('port-value-in', { async: false }),
  eventInPorts: hasMany('port-event-in', { async: false }),
  switchInPort: belongsTo('port-value-in', { async: false }),
  eventOutPort: belongsTo('port-event-out', { async: false }),

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

      // create ports
      let port;
      for (let i = 0; i < get(this, 'inputPortsCount'); i++) {
        port = this.addValueInPortWithoutAssignment(i, { canBeEmpty: true });
        get(this, 'valueInPorts').pushObject(port);
        port = this.addEventInPort(i, 'onEventIn', true);
        get(this, 'eventInPorts').pushObject(port);
      }

      this.addValueInPort('switch', 'switchInPort', { canBeEmpty: true });

      this.addValueOutPort('out', 'getValue', true);
      this.addEventOutPort('out', 'eventOutPort', true);

      console.log('module-switch.didCreate() requestSave()');
      this.requestSave();
    }
  },

  onEventIn(event) {
    console.log('Switch received event!', event);
  }

});
