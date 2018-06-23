import { set, get, observer } from '@ember/object';
import Module from '../module/model';
import DS from 'ember-data';

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

const {
  belongsTo,
  hasMany,
  attr
} = DS;

const maxInputs = 16;
const minInputs = 1;

export default Module.extend({

  type: 'module-plonkmap', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'PlonkMap',

  inputPortsCount: attr('number', { defaultValue: 4 }),
  semitoneRangeMin: attr('number', { defaultValue: 36 }),
  semitoneRangeMax: attr('number', { defaultValue: 84 }),
  voltageRangeMin: attr('number', { defaultValue: 0 }),
  voltageRangeMax: attr('number', { defaultValue: 4 }),

  eventInPorts: hasMany('port-event-in', { async: false }),
  eventOutPort: belongsTo('port-event-out', { async: false }),

  // given a desired voice index to output, return the smallest and largest note
  // values that will produce it.
  getNoteRangeForVoice(voice) {
    let voiceCount = get(this, 'inputPortsCount');
    let semitoneRangeMin = get(this, 'semitoneRangeMin');
    let semitoneRangeMax = get(this, 'semitoneRangeMax');
    let voltRangeMin = get(this, 'voltageRangeMin');
    let voltRangeMax = get(this, 'voltageRangeMax');

    /* example
    * 84 - 36 = 48 semitones
    * 4 - 0 = 4 volts
    * 4 / 48 = 0.0833 volts per semitone
    */

    let semitoneRange = semitoneRangeMax - semitoneRangeMin;
    let voltRange = voltRangeMax - voltRangeMin;
    let voltsPerSemitone = voltRange / semitoneRange;

    /*
    * 6 voices: voice 1 < 1v, voice 2 < 2v, voice 3 < 3v, voice 4 < 4v, voice 5 < 5v, voice 6 = 5v
    * 5v / (6 - 1) = 1 volt per voice
    */

    let voltsPerVoice = 5 / (voiceCount - 1); // 5 being the max volts accepted by plonk/eurorack

    /* if voice is 2
    * lowest voltage is (2 - 1) * 1 = 1
    * highest voltage is < 2 * 1 = 2
    */

    let minOutputVolts = (voice - 1) * voltsPerVoice;
    let maxOutputVolts = voice * voltsPerVoice;

    /* lowest semitone is 1 / 0.08333 = 12 + 36 = 48
    * highest semitone is 2 / 0.08333 = 24 + 36 = 60 - 1 = 59
    */

    let lowNote = Math.round((minOutputVolts / voltsPerSemitone) + semitoneRangeMin);
    let highNote = Math.round((maxOutputVolts / voltsPerSemitone) + semitoneRangeMin - 1);

    if (lowNote > semitoneRangeMax) {
      console.log('voice out of range');
    } else {
      highNote = Math.min(highNote, semitoneRangeMax);
      console.log('range:', lowNote, '->', highNote);
    }

  },

  onImportPortsCountChanged: observer('inputPortsCount', function() {
    if (get(this, 'hasDirtyAttributes')) {
      let currentCount = get(this, 'eventInPorts.length');
      let newCount = Math.min(Math.max(get(this, 'inputPortsCount'), minInputs), maxInputs);
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
      get(this, 'eventInPorts').pushObject(port);
    }
  },

  _removeInputPorts(count) {
    let port;
    for (let i = 0; i < count; i++) {
      port = get(this, 'eventInPorts').popObject();
      get(this, 'ports').removeObject(port);
      port.disconnect();
      port.destroyRecord();
    }
  },

  ready() {
    if (get(this, 'isNew')) {
      set(this, 'title', this.name);

      this.addNumberSetting('Inputs', 'inputPortsCount', this, { minValue: minInputs, maxValue: maxInputs });
      this.addNumberSetting('Semitone Range Min', 'semitoneRangeMin', this, { minValue: 0, maxValue: 127 });
      this.addNumberSetting('Semitone Range Max', 'semitoneRangeMax', this, { minValue: 0, maxValue: 127 });
      this.addNumberSetting('Voltage Min', 'voltageRangeMin', this, { minValue: -5, maxValue: 5 });
      this.addNumberSetting('Voltage Max', 'voltageRangeMax', this, { minValue: -5, maxValue: 5 });

      this.addValueOutPort('out', 'getValue', true);
      this.addEventOutPort('out', 'eventOutPort', true);

      // add array of input ports
      this._addInputPorts(get(this, 'inputPortsCount'));

      console.log('module-plonkmap.didCreate() requestSave()');
      this.requestSave();
    }
  },

  getValue() {
    if (this.selectedValueInPort) {
      return this.selectedValueInPort.getValue();
    }
    return null;
  },

  onEventIn(event, port) {
    let portNumber = parseInt(get(port, 'label'));
    if (!isNaN(portNumber)) {

      this.getNoteRangeForVoice(portNumber + 1);
      // let ports = get(this, 'valueInPorts');
      // this.selectedValueInPort = ports.objectAt(portNumber);
      // get(this, 'eventOutPort').sendEvent(event);
    }
  }

});
