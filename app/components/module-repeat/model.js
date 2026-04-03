import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Module from '../module/model';
import { belongsTo, attr } from '@ember-data/model';

const unitsMenuOptions = ['beats', 'ms'];
const modeMenuOptions = ['count only', 'gate only', 'count+gate'];

export default class ModuleRepeatModel extends Module {
  @service scheduler;

  type = 'module-repeat'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Repeat';

  @tracked latestTriggerTime = null;
  @tracked triggerDuration = null;
  unitsMenuOptions = unitsMenuOptions;
  modeMenuOptions = modeMenuOptions;

  @attr('string', { defaultValue: 'count only' }) mode;
  @attr('string', { defaultValue: 'beats' }) delayUnits;
  @attr('string', { defaultValue: 'beats' }) gateUnits;

  @belongsTo('port-value-in', { async: false, inverse: null }) tempoInPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) countInPort; // number of times to repeat
  @belongsTo('port-value-in', { async: false, inverse: null }) gateNumeratorInPort; // period to continue repeating
  @belongsTo('port-value-in', { async: false, inverse: null }) gateDenominatorInPort; // period to continue repeating
  @belongsTo('port-value-in', { async: false, inverse: null }) delayNumeratorInPort; // delay between repeats
  @belongsTo('port-value-in', { async: false, inverse: null }) delayDenominatorInPort; // delay between repeats
  @belongsTo('port-event-out', { async: false, inverse: null }) trigOutPort;

  get gateIsInBeats() {
    return this.gateUnits === 'beats';
  }

  get delayIsInBeats() {
    return this.delayUnits === 'beats';
  }

  get gateIsOn() {
    return this.mode === 'gate only' || this.mode === 'count+gate';
  }

  get countIsOn() {
    return this.mode === 'count only' || this.mode === 'count+gate';
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);

    if (this.isNew && this.ports.length === 0) {
      this.title = this.name;

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
      this.addMenuSetting('Mode', 'mode', 'modeMenuOptions', this);
      this.addMenuSetting('Delay Units', 'delayUnits', 'unitsMenuOptions', this);
      this.addMenuSetting('Gate Units', 'durationUnits', 'unitsMenuOptions', this);
    }
  }

  // when an event comes in, repeat the event after a delay.
  // multiple repeats can be generated from a single original event.
  // in count mode, an event repeats until a set number of repeats have been triggered.
  // in gate mode, an event repeats until a set period of time from the original event has elapsed.
  // in count+gate mode, an event repeats are limited by both count and gate.
  // gate and delay duration can be supplied in either beats or milliseconds.
  onEventIn(event) {
    let tempo = this.tempoInPort.getValue();
    let msPerBeat = 60000 / tempo;

    // gate is the maximum amount of time after the original event that repeats
    // will continue to fire.
    let gateIsOn = this.gateIsOn;
    let gateNumerator = this.gateNumeratorInPort.getValue();
    let gateDenominator = this.gateDenominatorInPort.getValue();
    let gate = gateNumerator / gateDenominator;
    if (this.delayIsInBeats) {
      gate *= msPerBeat;
    }

    // count is the maximum number of repeats that will fire for one original event.
    let countIsOn = this.countIsOn;
    let count = this.countInPort.getValue();

    // delay is the amount of time between each repeat of an original event.
    let delayNumerator = this.delayNumeratorInPort.getValue();
    let delayDenominator = this.delayDenominatorInPort.getValue();
    let delay = delayNumerator / delayDenominator;
    if (this.delayIsInBeats) {
      delay *= msPerBeat;
    }

    // examine incoming event and send it through if it's a queued repeat event
    if (event.repeatCount != null && event.repeatOriginalTargetTime != null) {
      this.trigOutPort.sendEvent(event);
      this.triggerDuration = event.duration;
      this.latestTriggerTime = event.targetTime;
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
      duration: delay,
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
      this.scheduler.queueEvent(repeatEvent, this.onEventIn.bind(this));
    }
  }
}
