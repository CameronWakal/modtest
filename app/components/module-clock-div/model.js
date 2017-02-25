import Ember from 'ember';
import Module from '../module/model';
import DS from 'ember-data';

const {
  computed,
  get,
  set
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

  count: 0,
  latestTriggerTime: null,
  triggerDuration: null,

  onClockIn(event) {
    let count = get(this, 'count');
    let divBy = get(this, 'divByPort').getValue();
    let shiftBy = get(this, 'shiftByPort').getValue();

    if (count - this.mod(shiftBy, divBy) === 0) {
      event.duration *= divBy;
      get(this, 'trigOutPort').sendEvent(event);
      set(this, 'latestTriggerTime', event.targetTime);
      set(this, 'triggerDuration', event.duration);
    }

    set(this, 'count', this.mod(count + 1, divBy));
  },

  onResetIn() {
    set(this, 'count', 0);
  },

  ready() {
    if (get(this, 'isNew')) {
      this.addEventInPort('clock', 'onClockIn', true);
      this.addEventInPort('reset', 'onResetIn', false);

      this.addValueInPort('div', 'divByPort', { isEnabled: false, defaultValue: 6, minValue: 1 });
      this.addValueInPort('shift', 'shiftByPort', { isEnabled: false, defaultValue: 0 });

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
