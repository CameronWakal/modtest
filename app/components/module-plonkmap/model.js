import { set, get, observer, computed } from '@ember/object';
import Module from '../module/model';
import DS from 'ember-data';

/*  Convenience utility to map triggers to sounds in an Intellijel Plonk eurorack module,
 *  via midi->cv.
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
  midiRangeMin: attr('number', { defaultValue: 36 }),
  midiRangeMax: attr('number', { defaultValue: 84 }),
  voltageRangeMin: attr('number', { defaultValue: 0 }),
  voltageRangeMax: attr('number', { defaultValue: 4 }),

  eventInPorts: hasMany('port-event-in', { async: false }),
  eventOutPort: belongsTo('port-event-out', { async: false }),

  kitLabel: computed('inputPortsCount', 'midiRangeMin', 'midiRangeMax', 'voltageRangeMin', 'voltageRangeMax', function(){
    let inputPortsCount = get('this', 'inputPortsCount'),
    let midiMin = get('this', 'midiRangeMin'),
    let midiMax = get('this', 'midiRangeMax'),
    let voltsMin = get('this', 'voltageRangeMin'),
    let voltsMax = get('this', 'voltageRangeMax'),

    // 4v/octave = 1/12v / semitone

    // 0-5v, 1v/octave = 60 semitones
    // 4 voices: 0-19, 20-39, 40-59, 60

    // offset by 36 min note:
    // 4 voices: 36-55, 56-75, 76-95, 96

  }),

  onImportPortsCountChanged: observer('inputPortsCount', function() {
    if (get(this, 'hasDirtyAttributes')) {
      let currentCount = get(this, 'valueInPorts.length');
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
    let currentCount = get(this, 'valueInPorts.length');
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
      this.addNumberSetting('Midi Range Min', 'midiRangeMin', this, { minValue: 0, maxValue: 127 });
      this.addNumberSetting('Midi Range Max', 'midiRangeMax', this, { minValue: 0, maxValue: 127 });
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
    if(this.selectedValueInPort) {
      return this.selectedValueInPort.getValue();
    }
    return null;
  },

  onEventIn(event, port) {
    let portNumber = parseInt(get(port, 'label'));
    if (!isNaN(portNumber)) {

      let ports = get(this, 'valueInPorts');
      this.selectedValueInPort = ports.objectAt(portNumber);

      get(this, 'eventOutPort').sendEvent(event);
    }
  }

});
