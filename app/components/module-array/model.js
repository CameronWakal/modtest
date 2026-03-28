import { belongsTo, attr } from '@ember-data/model';
import Module from '../module/model';
import { mod } from '../../utils/math-util';

const inputTypeMenuOptions = ['Number', 'Slider', 'Both', 'Button'];

export default class ModuleArrayModel extends Module {
  type = 'module-array'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Array';
  inputTypeMenuOptions = inputTypeMenuOptions;

  @belongsTo('array', { async: false, inverse: null }) steps;
  @belongsTo('port-group', { async: false, inverse: null }) readPortsGroup;
  @attr('string', { defaultValue: 'Number' }) inputType;
  @attr('number', { defaultValue: 1 }) displayScale;

  // map the value of each readPort to the current array. This is referenced by
  // the array in order to display the currently selected index in the UI.
  get currentIndexes() {
    if (!this.readPortsGroup?.valueInPorts || !this.steps?.items) {
      return [];
    }
    return this.readPortsGroup.valueInPorts.map(port => {
      if (port.computedValue == null) {
        return null;
      }
      return mod(port.computedValue, this.steps.items.length);
    });
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);

    if (this.isNew && this.ports.length === 0) {
      this.title = this.name;

      // create steps
      let steps = this.store.createRecord('array');
      this.steps = steps;
      this.steps.setLength(8);

      // create settings
      this.addMenuSetting('Input Type', 'inputType', 'inputTypeMenuOptions', this);

      // todo: make config option for settings that must have a non-null numeric value
      this.addNumberSetting('Length', 'steps.length', this, { minValue: 1, maxValue: 64 });
      this.addNumberSetting('Input Min', 'steps.valueMin', this);
      this.addNumberSetting('Input Max', 'steps.valueMax', this);
      this.addNumberSetting('Input Step', 'steps.valueStep', this, { minValue: 1 });
      this.addNumberSetting('Display Scale', 'displayScale', this, { minValue: 1 });

      // add an expandable group of value input/output pairs
      let readPorts = this.addPortGroup({ minSets: 1, maxSets: 4 });
      this.readPortsGroup = readPorts;
      this.addValueInPort('0', 'indexInPort', { canBeEmpty: true });
      this.addValueOutPort('0', 'getValue', true);

      this.addNumberSetting('read ports', 'readPortsGroup.portSetsCount', this, { minValue: 1, maxValue: 4 });
      readPorts.portSetsCount = 2;

      this.requestSave();
    }
    // Ensure dataManager is set for loaded records (async: false means it's available in init)
    if (this.steps) {
      this.steps.dataManager = this;
    }
  }

  getValue(port) {
    let readPortNumber = parseInt(port.label);

    let readPorts = this.readPortsGroup.valueInPorts;
    let readPort = readPorts.at(readPortNumber);
    let index = readPort.getValue();
    let item = this.steps.items.find(i => i.index === mod(index, this.steps.items.length));
    if (item) {
      return item.value;
    }
    return null;
  }

  remove() {
    // Embedded records (steps) are removed automatically with the parent module
    super.remove();
  }

  save() {
    if (this.steps) {
      this.steps.save();
    }
    super.save();
  }
}
