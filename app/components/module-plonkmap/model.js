import { set, get, observer, computed } from '@ember/object';
import Module from '../module/model';
import { belongsTo, hasMany, attr } from '@ember-data/model';


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

export default Module.extend({

  type: 'module-plonkmap', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'PlonkMap',

  // number of plonk presets we want to be able to trigger
  inputPortsCount: attr('number', { defaultValue: 4 }),

  // lowest and highest midi notes the midi->cv interface can generate
  semitoneRangeMin: attr('number', { defaultValue: 36 }),
  semitoneRangeMax: attr('number', { defaultValue: 84 }),

  // lowest and highest voltages the midi->cv interface can generate
  voltageRangeMin: attr('number', { defaultValue: 0 }),
  voltageRangeMax: attr('number', { defaultValue: 4 }),

  // plonk preset index set by the latest event in
  preset: null,

  eventInPorts: hasMany('port-event-in', { async: false }),
  eventOutPort: belongsTo('port-event-out', { async: false }),

  // the number of presets you need to include in your plonk patch, in order to have all the
  // inputPorts on this module be addressable via 4v midi->cv
  // e.g. if I have 4 input ports, I need to set my plonk to address 6 presets, in order that
  // the first 4 of 6 can be addressable in the 0-4v range.
  plonkPresetsCount: computed('inputPortsCount', 'voltageRangeMax', function() {
    return Math.floor((plonkVoltageMax / this.voltageRangeMax) * this.inputPortsCount + 1);
  }),

  semitoneRange: computed('semitoneRangeMax', 'semitoneRangeMin', function() {
    return this.semitoneRangeMax - this.semitoneRangeMin;
  }),

  voltageRange: computed('voltageRangeMax', 'voltageRangeMin', function() {
    return this.voltageRangeMax - this.voltageRangeMin;
  }),

  noteForVoltage(voltage) {
    let rangeFraction = (voltage - this.voltageRangeMin) / this.voltageRange;
    let noteInRange = rangeFraction * this.semitoneRange;
    return noteInRange + this.semitoneRangeMin;
  },

  // the lowest voltage that will trigger the plonk preset at the arg index
  minVoltageForPlonkPreset(preset) {
    return (preset / (this.plonkPresetsCount - 1)) * plonkVoltageMax;
  },

  // the lowest midi note that would trigger the arg preset
  lowestNoteForPlonkPreset(preset) {
    let minVoltage = this.minVoltageForPlonkPreset(preset);
    return Math.ceil(this.noteForVoltage(minVoltage));
  },

  // the highest midi note that would trigger the arg preset
  highestNoteForPlonkPreset(preset) {
    let maxVoltage = this.minVoltageForPlonkPreset(preset + 1);
    return Math.ceil(this.noteForVoltage(maxVoltage) - 1);
  },

  onAttrChanged: observer('semitoneRangeMin', 'semitoneRangeMax', 'voltageRangeMin', 'voltageRangeMax', function() {
    if (this.hasDirtyAttributes) {
      this.requestSave();
    }
  }),

  onImportPortsCountChanged: observer('inputPortsCount', function() {
    if (this.hasDirtyAttributes) {
      let currentCount = get(this, 'eventInPorts.length');
      let newCount = Math.min(Math.max(this.inputPortsCount, minInputs), maxInputs);
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
    let currentCount = get(this, 'eventInPorts.length');
    for (let i = 0; i < count; i++) {
      port = this.addEventInPort(currentCount + i, 'onEventIn', true);
      this.eventInPorts.pushObject(port);
    }
  },

  _removeInputPorts(count) {
    let port;
    for (let i = 0; i < count; i++) {
      port = this.eventInPorts.popObject();
      this.ports.removeObject(port);
      port.disconnect();
      port.destroyRecord();
    }
  },

  init() {
    this._super(...arguments);
    if (this.isNew) {
      set(this, 'title', this.name);

      this.addNumberSetting('Inputs', 'inputPortsCount', this, { minValue: minInputs, maxValue: maxInputs });
      this.addNumberSetting('Semitone Range Min', 'semitoneRangeMin', this, { minValue: 0, maxValue: 127 });
      this.addNumberSetting('Semitone Range Max', 'semitoneRangeMax', this, { minValue: 0, maxValue: 127 });
      this.addNumberSetting('Voltage Min', 'voltageRangeMin', this, { minValue: -5, maxValue: 5 });
      this.addNumberSetting('Voltage Max', 'voltageRangeMax', this, { minValue: -5, maxValue: 5 });

      this.addValueOutPort('low', 'getLowNote', true);
      this.addValueOutPort('high', 'getHighNote', true);
      this.addEventOutPort('out', 'eventOutPort', true);

      // add array of input ports
      this._addInputPorts(this.inputPortsCount);

      console.log('module-plonkmap.didCreate() requestSave()');
      this.requestSave();
    }
  },

  getLowNote() {
    return Math.max(this.lowestNoteForPlonkPreset(this.preset), this.semitoneRangeMin);
  },

  getHighNote() {
    return Math.min(this.highestNoteForPlonkPreset(this.preset), this.semitoneRangeMax);
  },

  onEventIn(event, port) {
    let portNumber = parseInt(get(port, 'label'));
    if (!isNaN(portNumber)) {

      this.preset = portNumber;
      this.eventOutPort.sendEvent(event);
    }
  }

});
