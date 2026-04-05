import Module from '../module/model';
import { belongsTo, hasMany, attr } from '@ember-data/model';
import { addObserver } from '@ember/object/observers';


/*  Convenience utility to map triggers to sounds in an Intellijel Plonk eurorack module,
 *  via midi->cv.
 *
 *  midi->cv interface will generally map 48 semitones over a range of 0-4v
 *  plonk will map an arbitrary number of voice assignments over a range of 0-5v
 *  this module will make it a bit more convenient to bridge the gap.
 *
 *  the semitone and voltage range of the midi interface, and the number of
 *  voices mapped on the plonk, are configurable here via module settings.
 */

const maxInputs = 16;
const minInputs = 1;
const plonkVoltageMax = 5;

export default class ModulePlonkmapModel extends Module {
  type = 'module-plonkmap'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'PlonkMap';

  // number of plonk presets we want to be able to trigger
  @attr('number', { defaultValue: 4 }) inputPortsCount;

  // lowest and highest midi notes the midi->cv interface can generate
  @attr('number', { defaultValue: 36 }) semitoneRangeMin;
  @attr('number', { defaultValue: 84 }) semitoneRangeMax;

  // lowest and highest voltages the midi->cv interface can generate
  @attr('number', { defaultValue: 0 }) voltageRangeMin;
  @attr('number', { defaultValue: 4 }) voltageRangeMax;

  // plonk preset index set by the latest event in
  preset = null;

  @hasMany('port-event-in', { async: false, inverse: null }) eventInPorts;
  @belongsTo('port-event-out', { async: false, inverse: null }) eventOutPort;

  // the number of presets you need to include in your plonk patch, in order to have all the
  // inputPorts on this module be addressable via 4v midi->cv
  // e.g. if I have 4 input ports, I need to set my plonk to address 6 presets, in order that
  // the first 4 of 6 can be addressable in the 0-4v range.
  get plonkPresetsCount() {
    return Math.floor((plonkVoltageMax / this.voltageRangeMax) * this.inputPortsCount + 1);
  }

  get semitoneRange() {
    return this.semitoneRangeMax - this.semitoneRangeMin;
  }

  get voltageRange() {
    return this.voltageRangeMax - this.voltageRangeMin;
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    addObserver(this, 'inputPortsCount', this._inputPortsCountChanged);
  }

  configure() {
    this.addNumberSetting('Inputs', 'inputPortsCount', this, { minValue: minInputs, maxValue: maxInputs });
    this.addNumberSetting('Semitone Range Min', 'semitoneRangeMin', this, { minValue: 0, maxValue: 127 });
    this.addNumberSetting('Semitone Range Max', 'semitoneRangeMax', this, { minValue: 0, maxValue: 127 });
    this.addNumberSetting('Voltage Min', 'voltageRangeMin', this, { minValue: -5, maxValue: 5 });
    this.addNumberSetting('Voltage Max', 'voltageRangeMax', this, { minValue: -5, maxValue: 5 });
    this.addValueOutPort('low', 'getLowNote', true);
    this.addValueOutPort('high', 'getHighNote', true);
    this.addEventOutPort('out', 'eventOutPort', true);
    this._addInputPorts(this.inputPortsCount);
  }

  _inputPortsCountChanged() {
    let currentCount = this.eventInPorts?.length || 0;
    let newCount = Math.min(Math.max(this.inputPortsCount, minInputs), maxInputs);
    let change = newCount - currentCount;
    if (change > 0) {
      this._addInputPorts(change);
    } else if (change < 0) {
      this._removeInputPorts(change * -1);
    }
  }

  _addInputPorts(count) {
    let port;
    let currentCount = this.eventInPorts?.length || 0;
    for (let i = 0; i < count; i++) {
      // Pass label as string to ensure it's preserved during serialization
      port = this.addEventInPort(String(currentCount + i), 'onEventIn', true);
      this.eventInPorts.push(port);
    }
  }

  _removeInputPorts(count) {
    let port;
    for (let i = 0; i < count; i++) {
      port = this.eventInPorts.pop();
      const portIndex = this.ports.indexOf(port);
      if (portIndex !== -1) {
        this.ports.splice(portIndex, 1);
      }
      port.disconnect();
      this.store.unloadRecord(port);
    }
  }

  noteForVoltage(voltage) {
    let rangeFraction = (voltage - this.voltageRangeMin) / this.voltageRange;
    let noteInRange = rangeFraction * this.semitoneRange;
    return noteInRange + this.semitoneRangeMin;
  }

  // the lowest voltage that will trigger the plonk preset at the arg index
  minVoltageForPlonkPreset(preset) {
    return (preset / (this.plonkPresetsCount - 1)) * plonkVoltageMax;
  }

  // the lowest midi note that would trigger the arg preset
  lowestNoteForPlonkPreset(preset) {
    let minVoltage = this.minVoltageForPlonkPreset(preset);
    return Math.ceil(this.noteForVoltage(minVoltage));
  }

  // the highest midi note that would trigger the arg preset
  highestNoteForPlonkPreset(preset) {
    let maxVoltage = this.minVoltageForPlonkPreset(preset + 1);
    return Math.ceil(this.noteForVoltage(maxVoltage) - 1);
  }

  getLowNote() {
    return Math.max(this.lowestNoteForPlonkPreset(this.preset), this.semitoneRangeMin);
  }

  getHighNote() {
    return Math.min(this.highestNoteForPlonkPreset(this.preset), this.semitoneRangeMax);
  }

  onEventIn(event, port) {
    let portNumber = parseInt(port.label);
    if (!isNaN(portNumber)) {
      this.preset = portNumber;
      this.eventOutPort.sendEvent(event);
    }
  }
}
