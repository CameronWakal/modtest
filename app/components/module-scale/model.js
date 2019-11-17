import { set, get } from '@ember/object';
import { map } from '@ember/object/computed';
import { mod, div } from '../../utils/math-util';
import DS from 'ember-data';
import Module from '../module/model';

const {
  belongsTo
} = DS;

export default Module.extend({

  type: 'module-scale', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Scale',

  degreesInScale: 7,
  inputType: 'Number',
  mode: null,
  degrees: belongsTo('array', { async: false }),

  degreeInPortsGroup: belongsTo('port-group', { async: false }),
  octaveInPort: belongsTo('port-value-in', { async: false }),
  rootInPort: belongsTo('port-value-in', { async: false }),
  modeInPort: belongsTo('port-value-in', { async: false }),

  // map the value of each valueInPort to the current scale. This is referenced by
  // the degrees array in order to display the currently selected intervals in the UI.
  currentIndexes: map('degreeInPortsGroup.valueInPorts.@each.computedValue', function(port) {
    if (port.computedValue == null) {
      return null;
    }
    return mod(port.computedValue, this.degreesInScale);
  }),

  updateScale() {
    let mode = get(this, 'modeInPort').getValue() % 7;
    if (this.mode == mode) {
      return;
    }
    this.mode = mode;
    console.log('updating scale mode to', mode);

    let newValues;

    switch (mode) {
      case 0:
        newValues = [0, 2, 4, 5, 7, 9, 11];
        break;
      case 1:
        newValues = [0, 2, 3, 5, 7, 9, 10];
        break;
      case 2:
        newValues = [0, 1, 3, 5, 7, 8, 10];
        break;
      case 3:
        newValues = [0, 2, 4, 6, 7, 9, 11];
        break;
      case 4:
        newValues = [0, 2, 4, 5, 7, 9, 10];
        break;
      case 5:
        newValues = [0, 2, 3, 5, 7, 8, 10];
        break;
      case 6:
        newValues = [0, 1, 3, 5, 6, 8, 10];
        break;
      default:
        console.log('module-scale error – unknown mode requested:', mode);
        return;
    }

    get(this, 'degrees.items').then(function(items) {
      items.forEach((item) => {
        set(item, 'value', newValues[item.index]);
      });
    });

  },

  getNote(port) {

    let voiceNumber = parseInt(get(port, 'label'));
    let degreeInPorts = get(this, 'degreeInPortsGroup.valueInPorts');
    let degreeInPort = degreeInPorts.objectAt(voiceNumber);

    // 1. get input values
    // 2. set defaults if they are null
    // 3. convert to integers
    // 4. do math

    let degree = degreeInPort.getValue();
    let octave = get(this, 'octaveInPort').getValue();
    let root = get(this, 'rootInPort').getValue();

    if (degree != null) {
      let degreeInOctave = mod(degree, get(this, 'degreesInScale'));
      let degreeItem = get(this, 'degrees.items').findBy('index', degreeInOctave);
      let intervalForDegree = get(degreeItem, 'value');
      if (intervalForDegree == null) {
        return null;
      }

      octave = octave + 1 + div(degree, get(this, 'degreesInScale'));
      let note = (octave * 12) + root + intervalForDegree;
      // console.log('octave:'+octave+' root:'+root+' degree:'+degree+' interval:'+intervalForDegree+' note:'+note);
      return note;
    }
  },

  build() {
    set(this, 'title', this.name);

    // create degrees
    let degrees = this.store.createRecord('array');
    set(this, 'degrees', degrees);
    set(this, 'degrees.valueMax', 11);
    set(this, 'degrees.length', this.degreesInScale);
    this.degrees.dataManager = this;

    // create ports
    this.addValueInPort('octave', 'octaveInPort', { isEnabled: false, defaultValue: 3, minValue: -2, maxValue: 8 });
    this.addValueInPort('root', 'rootInPort', { isEnabled: false, defaultValue: 0 });
    this.addValueInPort('mode', 'modeInPort', { isEnabled: false, defaultValue: 0, disabledValueChangedMethod: 'updateScale' });
    this.addEventInPort('update', 'updateScale', false);

    // add an expandable group of input ports
    let degreeInPorts = this.addPortGroup({ minSets: 1, maxSets: 4 });
    set(this, 'degreeInPortsGroup', degreeInPorts);
    this.addValueInPort('0', 'degreeInPort', { canBeEmpty: true });
    this.addValueOutPort('0', 'getNote', true);

    this.addNumberSetting('voices', 'degreeInPortsGroup.portSetsCount', this, { minValue: 1, maxValue: 4 });
    set(degreeInPorts, 'portSetsCount', 2);

    this.updateScale();

    console.log('module-scale.didCreate() requestSave()');
    this.requestSave();

  },

  ready() {
    if (!this.isNew) {
      get(this, 'degrees').dataManager = this;
    }
  },

  remove() {
    get(this, 'degrees').remove();
    this._super();
  },

  save() {
    get(this, 'degrees').save();
    this._super();
  }

});
