import Ember from 'ember';
import Module from '../module/model';
import DS from 'ember-data';

export default Module.extend({

  label: 'Clock Div',

  // receives input events and sends an output on the first event, and then every nth event after,
  // n being divBy. If a shiftBy value is provided, the output event will be shifted later by that
  // many input events. If shiftBy is greater than divBy, the shift value will be shiftBy%divBy.
  // a resetIn does not cause an out event, it just resets the module for the next clockIn.

  divByPort: DS.belongsTo('port-value-in', {async:false}),
  shiftByPort: DS.belongsTo('port-value-in', {async:false}),
  trigOutPort: DS.belongsTo('port-event-out', {async: false}),

  count: DS.attr('number', {defaultValue: 0}),

  isTriggering: Ember.computed('count', 'shiftBy', 'divBy', function() {
    if(this.get('shiftByPort') && this.get('divByPort')) {
      return this.get('count') - this.mod(this.get('shiftByPort').getValue(), this.get('divByPort').getValue()) === 1;
    } else {
      return false;
    }
  }),

  onClockIn(event) {
    let count = this.get('count');
    let divBy = this.get('divByPort').getValue();
    let shiftBy = this.get('shiftByPort').getValue();
    if( divBy == null ) { divBy = 1; }
    if( shiftBy == null ) { shiftBy = 0; }

    if( count - this.mod(shiftBy, divBy) === 0 ) {
      this.get('trigOutPort').sendEvent(event);
    }

    this.set('count', this.mod(count+1, divBy) );
  },

  onResetIn() {
    this.set('count', 0);
  },

  didCreate() {
    this.addEventInPort('clock', 'onClockIn');
    this.addEventInPort('reset', 'onResetIn');
    this.addValueInPort('div', 'divByPort');
    this.addValueInPort('shift', 'shiftByPort');
    this.addEventOutPort('trig', 'trigOutPort');
    this.save();
  },

  mod(num, mod) {
    var remain = num % mod;
    return Math.floor(remain >= 0 ? remain : remain + mod);
  },

});