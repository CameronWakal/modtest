import Ember from 'ember';
import Module from '../module/model';
import DS from 'ember-data';

const {
  computed
} = Ember;

const {
  belongsTo,
  attr
} = DS;

export default Module.extend({

  type: 'module-clock-div', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Clock Div',

  // receives input events and sends an output on the first event, and then every nth event after,
  // n being divBy. If a shiftBy value is provided, the output event will be shifted later by that
  // many input events. If shiftBy is greater than divBy, the shift value will be shiftBy%divBy.
  // a resetIn does not cause an out event, it just resets the module for the next clockIn.

  divByPort: belongsTo('port-value-in', { async: false }),
  shiftByPort: belongsTo('port-value-in', { async: false }),
  trigOutPort: belongsTo('port-event-out', { async: false }),

  count: attr('number', { defaultValue: 0 }),

  isTriggering: computed('count', 'shiftBy', 'divBy', function() {
    if (this.get('shiftByPort') && this.get('divByPort')) {
      return this.get('count') - this.mod(this.get('shiftByPort').getValue(), this.get('divByPort').getValue()) === 1;
    } else {
      return false;
    }
  }),

  onClockIn(event) {
    let count = this.get('count');
    let divBy = this.get('divByPort').getValue();
    let shiftBy = this.get('shiftByPort').getValue();
    if (divBy == null) {
      divBy = 6;
    }
    if (shiftBy == null) {
      shiftBy = 0;
    }

    if (count - this.mod(shiftBy, divBy) === 0) {
      this.get('trigOutPort').sendEvent(event);
    }

    this.set('count', this.mod(count + 1, divBy));
  },

  onResetIn() {
    this.set('count', 0);
  },

  ready() {
    if (this.get('isNew')) {
      this.addEventInPort('clock', 'onClockIn', true);
      this.addEventInPort('reset', 'onResetIn', false);
      this.addValueInPort('div', 'divByPort', false);
      this.addValueInPort('shift', 'shiftByPort', false);
      this.addEventOutPort('trig', 'trigOutPort', true);
      console.log('module-clock-div.didCreate() requestSave()');
      this.requestSave();
    }
  },

  mod(num, mod) {
    let remain = num % mod;
    return Math.floor(remain >= 0 ? remain : remain + mod);
  }

});