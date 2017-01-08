import Ember from 'ember';
import Module from '../module/model';
import DS from 'ember-data';

const {
  get,
  inject
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
    let gateIsOn, countIsOn, gateIsInBeats, delayIsInBeats,
      tempo, msPerBeat,
      count,
      gateNumerator, gateDenominator, gate,
      delayNumerator, delayDenominator, delay,
      repeatEvent, eventRepeatCount, eventOriginalTargetTime,
      eventShouldRepeat;

    // send event
    // examine incoming event and send it through if it's a queued repeat event
    if (event.repeatCount != null && event.repeatOriginalTargetTime != null) {
      console.log('sendEvent repeatCount', event.repeatCount);
      get(this, 'trigOutPort').sendEvent(event);
    }

    // prep settings
    // check whether gate and count will be used, and in what units
    gateIsOn = get(this, 'mode') === 'gate only' || get(this, 'mode') === 'count+gate';
    countIsOn = get(this, 'mode') === 'count only' || get(this, 'mode') === 'count+gate';
    gateIsInBeats = get(this, 'gateUnits') === 'beats';
    delayIsInBeats = get(this, 'delayUnits') === 'beats';

    // tempo setup
    // if beats will be used, calculate msPerBeat based on tempo
    if (gateIsInBeats || delayIsInBeats) {
      tempo = get(this, 'tempo');
      if (tempo <= 0 || tempo == null) {
        tempo = 100;
      }
      msPerBeat = 60000 / tempo;
      console.log('tempo', tempo, 'msPerBeat', msPerBeat);
    }

    // gate setup
    // calculate gate duration if gate is on
    if (gateIsOn) {
      gateNumerator = get(this, 'gateNumeratorInPort').getValue();
      gateDenominator = get(this, 'gateDenominatorInPort').getValue();
      if (gateNumerator == null || gateNumerator <= 0) {
        return;
      }
      if (gateDenominator == null || gateDenominator <= 0) {
        gateDenominator = 1;
      }
      gate = gateNumerator / gateDenominator;
      if (gateIsInBeats) {
        gate *= msPerBeat;
      }
      console.log('gate', gate, 'isInBeats', gateIsInBeats);
    }

    // count setup
    if (countIsOn) {
      count = get(this, 'countInPort').getValue();
      if (count == null || count <= 0) {
        return;
      }
      console.log('count', count);
    }

    // delay setup
    delayNumerator = get(this, 'delayNumeratorInPort').getValue();
    delayDenominator = get(this, 'delayDenominatorInPort').getValue();
    if (delayNumerator == null || delayNumerator <= 0) {
      return;
    }
    if (delayDenominator == null || delayDenominator <= 0) {
      delayDenominator = 1;
    }
    delay = delayNumerator / delayDenominator;
    if (delayIsInBeats) {
      delay *= msPerBeat;
    }
    console.log('delay', delay, 'isInBeats', delayIsInBeats);

    // prep event
    // add repeat properties to event if not already present
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

    // queue repeat event
    // check if event meets the criteria to be repeated, if so, queue
    eventShouldRepeat = true;
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
      this.addValueInPort('tempo', 'tempoInPort', true);
      this.addValueInPort('count', 'countInPort', true);
      this.addValueInPort('gate', 'gateNumeratorInPort', true);
      this.addValueInPort('gatedenom', 'gateDenominatorInPort', false);
      this.addValueInPort('delay', 'delayNumeratorInPort', true);
      this.addValueInPort('delaydenom', 'delayDenominatorInPort', false);
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
