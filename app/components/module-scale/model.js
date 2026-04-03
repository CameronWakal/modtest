import { mod } from '../../utils/math-util';
import { belongsTo } from '@ember-data/model';
import Module from '../module/model';

export default class ModuleScaleModel extends Module {
  type = 'module-scale'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Scale';

  degreesInScale = 7;
  inputType = 'Number';
  mode = null;

  @belongsTo('array', { async: false, inverse: null }) degrees;
  @belongsTo('port-group', { async: false, inverse: null }) degreeInPortsGroup;
  @belongsTo('port-value-in', { async: false, inverse: null }) octaveInPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) rootInPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) modeInPort;

  // Map the value of each valueInPort to the current scale. This is referenced by
  // the degrees array in order to display the currently selected intervals in the UI.
  get currentIndexes() {
    if (!this.degreeInPortsGroup?.valueInPorts) {
      return [];
    }
    return this.degreeInPortsGroup.valueInPorts.map(port => {
      if (port.computedValue == null) {
        return null;
      }
      return mod(port.computedValue, this.degreesInScale);
    });
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);

    if (this.isNew && this.ports.length === 0) {
      this.title = this.name;

      // Create degrees
      let degrees = this.store.createRecord('array');
      this.degrees = degrees;
      this.degrees.valueMax = 11;
      this.degrees.setLength(this.degreesInScale);
      this.degrees.dataManager = this;

      // Create ports
      this.addValueInPort('octave', 'octaveInPort', { isEnabled: false, defaultValue: 3, minValue: -2, maxValue: 8 });
      this.addValueInPort('root', 'rootInPort', { isEnabled: false, defaultValue: 0 });
      this.addValueInPort('mode', 'modeInPort', { isEnabled: false, defaultValue: 0, disabledValueChangedMethod: 'updateScale' });
      this.addEventInPort('update', 'updateScale', false);

      // Add an expandable group of input ports
      let degreeInPorts = this.addPortGroup({ minSets: 1, maxSets: 4 });
      this.degreeInPortsGroup = degreeInPorts;
      this.addValueInPort('0', 'degreeInPort', { canBeEmpty: true });
      this.addValueOutPort('0', 'getNote', true);

      this.addNumberSetting('voices', 'degreeInPortsGroup.portSetsCount', this, { minValue: 1, maxValue: 4 });
      degreeInPorts.portSetsCount = 2;

      this.updateScale();
    }
    // Ensure dataManager is set for loaded records (async: false means it's available in init)
    if (this.degrees) {
      this.degrees.dataManager = this;
    }
  }

  updateScale() {
    let mode = this.modeInPort.getValue() % 7;
    if (this.mode == mode) {
      return;
    }
    this.mode = mode;

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

    let items = this.degrees.items;
    items.forEach((item) => {
      item.value = newValues[item.index];
    });
  }

  getNote(port) {
    let voiceNumber = parseInt(port.label);
    let degreeInPorts = this.degreeInPortsGroup.valueInPorts;
    let degreeInPort = degreeInPorts.at(voiceNumber);

    // 1. get input values
    // 2. set defaults if they are null
    // 3. convert to integers
    // 4. do math

    let degree = degreeInPort.getValue();
    let octave = this.octaveInPort.getValue();
    let root = this.rootInPort.getValue();

    if (degree != null) {
      let degreeInOctave = mod(degree, this.degreesInScale);
      let degreeItem = this.degrees.items.find(i => i.index === degreeInOctave);
      let intervalForDegree = degreeItem?.value;
      if (intervalForDegree == null) {
        return null;
      }

      octave = octave + 1 + Math.floor(degree / this.degreesInScale);
      let note = (octave * 12) + root + intervalForDegree;
      return note;
    }
  }

  remove() {
    // Embedded records (degrees) are removed automatically with the parent module
    super.remove();
  }
}
