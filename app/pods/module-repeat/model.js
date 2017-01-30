import Ember from 'ember';
import Module from '../module/model';
import DS from 'ember-data';

const {
  get,
  inject,
  computed,
  computed: { equal }
} = Ember;

const {
  belongsTo,
  attr
} = DS;

export default Module.extend({

  type: 'module-repeat', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Repeat',

  mode: attr('string', { defaultValue: 'count only' }),
  delayUnits: attr('string', { defaultValue: 'beats' }),
  gateUnits: attr('string', { defaultValue: 'beats' }),

  gateIsOn: computed('mode', function() {
    return get(this, 'mode') === 'gate only' || get(this, 'mode') === 'count+gate';
  }),
  countIsOn: computed('mode', function() {
    return get(this, 'mode') === 'count only' || get(this, 'mode') === 'count+gate';
  }),
  gateIsInBeats: equal('gateUnits', 'beats'),
  delayIsInBeats: equal('delayUnits', 'beats'),

  scheduler: inject.service(),

  tempoInPort: belongsTo('port-value-in', { async: false }),
  countInPort: belongsTo('port-value-in', { async: false }), // number of times to repeat
  gateNumeratorInPort: belongsTo('port-value-in', { async: false }), // period to continue repeating
  gateDenominatorInPort: belongsTo('port-value-in', { async: false }), // period to continue repeating
  delayNumeratorInPort: belongsTo('port-value-in', { async: false }), // delay between repeats
  delayDenominatorInPort: belongsTo('port-value-in', { async: false }), // delay between repeats
  trigOutPort: belongsTo('port-event-out', { async: false }),

  // when an event comes in, repeat the event after a delay.
  // multiple repeats can be generated from a single original event.
  // in count mode, an event repeats until a set number of repeats have been triggered.
  // in gate mode, an event repeats until a set period of time from the original event has elapsed.
  // in count+gate mode, an event repeats are limited by both count and gate.
  // gate and delay duration can be supplied in either beats or milliseconds.
  onEventIn(event) {
    let tempo = get(this, 'tempo');
    let msPerBeat = 60000 / tempo;

    // gate is the maximum amount of time after the original event that repeats
    // will continue to fire.
    let gateIsOn = get(this, 'gateIsOn');
    let gateNumerator = get(this, 'gateNumeratorInPort').getValue();
    let gateDenominator = get(this, 'gateDenominatorInPort').getValue();
    let gate = gateNumerator / gateDenominator;
    if (get(this, 'delayIsInBeats')) {
      gate *= msPerBeat;
    }
    
    // count is the maximum number of repeats that will fire for one original event.
    let countIsOn = get(this, 'countIsOn');
    let count = get(this, 'countInPort').getValue();

    // delay is the amount of time between each repeat of an original event.
    let delayNumerator = get(this, 'delayNumeratorInPort').getValue();
    let delayDenominator = get(this, 'delayDenominatorInPort').getValue();
    let delay = delayNumerator / delayDenominator;
    if (get(this, 'delayIsInBeats')) {
      delay *= msPerBeat;
    }

    // examine incoming event and send it through if it's a queued repeat event
    if (event.repeatCount != null && event.repeatOriginalTargetTime != null) {
      // console.log('sendEvent repeatCount', event.repeatCount);
      get(this, 'trigOutPort').sendEvent(event);
    }

    // create the next repeat event based on incoming event properties
    let repeatEvent, eventRepeatCount, eventOriginalTargetTime;
    if (event.repeatCount == null) {
      eventRepeatCount = 1;
    } else {
      eventRepeatCount = event.repeatCount + 1;
    }
    if (event.repeatOriginalTargetTime == null) {
      eventOriginalTargetTime = event.targetTime;
    } else {
      eventOriginalTargetTime = event.repeatOriginalTargetTime;
    }
    repeatEvent = {
      targetTime: event.targetTime + delay,
      outputTime: event.outputTime + delay,
      repeatCount: eventRepeatCount,
      repeatOriginalTargetTime: eventOriginalTargetTime
    };

    // if the new event should be repeated, send it to the queue
    let eventShouldRepeat = true;
    if (countIsOn && repeatEvent.repeatCount > count) {
      eventShouldRepeat = false;
    }
    if (gateIsOn && repeatEvent.targetTime > repeatEvent.repeatOriginalTargetTime + gate) {
      eventShouldRepeat = false;
    }
    if (eventShouldRepeat) {
      get(this, 'scheduler').queueEvent(repeatEvent, this.onEventIn.bind(this));
    }

  },

  ready() {
    if (this.get('isNew')) {
      this.addEventInPort('trig', 'onEventIn', true);

      // create value-in ports
      this.addValueInPort('tempo', 'tempoInPort', { defaultValue: 100, minValue: 1 });
      this.addValueInPort('count', 'countInPort', { defaultValue: 0, minValue: 0 });
      this.addValueInPort('gate', 'gateNumeratorInPort', { defaultValue: 0, minValue: 0 });
      this.addValueInPort('gatedenom', 'gateDenominatorInPort', { isEnabled: false, defaultValue: 1, minValue: 1 });
      this.addValueInPort('delay', 'delayNumeratorInPort', { defaultValue: 1, minValue: 1 });
      this.addValueInPort('delaydenom', 'delayDenominatorInPort', { isEnabled: false, defaultValue: 1, minValue: 1 });

      this.addEventOutPort('trig', 'trigOutPort', true);

      // create settings
      this.addMenuSetting('Mode', 'mode', this, ['count only', 'gate only', 'count+gate']);
      this.addMenuSetting('Delay Units', 'delayUnits', this, ['beats', 'ms']);
      this.addMenuSetting('Gate Units', 'durationUnits', this, ['beats', 'ms']);

      console.log('module-repeat.didCreate() requestSave()');
      this.requestSave();
    }
  },

  mod(num, mod) {
    let remain = num % mod;
    return Math.floor(remain >= 0 ? remain : remain + mod);
  }

});
