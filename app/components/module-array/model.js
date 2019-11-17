import { set, get, observer } from '@ember/object';
import { map } from '@ember/object/computed';
import DS from 'ember-data';
import Module from '../module/model';
import { mod } from '../../utils/math-util';

const {
  belongsTo,
  attr
} = DS;

const inputTypeMenuOptions = ['Number', 'Slider', 'Both', 'Button'];

export default Module.extend({

  type: 'module-array', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Array',
  inputTypeMenuOptions,

  steps: belongsTo('array', { async: false, inverse: null }),
  readPortsGroup: belongsTo('port-group', { async: false }),
  inputType: attr('string', { defaultValue: 'Number' }),
  displayScale: attr('number', { defaultValue: 1 }),

  onAttrChanged: observer('inputType', 'displayScale', function() {
    if (get(this, 'hasDirtyAttributes')) {
      this.requestSave();
    }
  }),

  // map the value of each readPort to the current array. This is referenced by
  // the array in order to display the currently selected index in the UI.
  currentIndexes: map('readPortsGroup.valueInPorts.@each.computedValue', function(port) {
    if (port.computedValue == null) {
      return null;
    }
    return mod(port.computedValue, this.steps.items.length);
  }),

  getValue(port) {
    let readPortNumber = parseInt(get(port, 'label'));

    let readPorts = this.readPortsGroup.valueInPorts;
    let readPort = readPorts.objectAt(readPortNumber);
    let index = readPort.getValue();
    let item = this.steps.items.findBy('index', mod(index, this.steps.items.length));
    if (item) {
      return item.value;
    }
    return null;
  },

  build() {
    set(this, 'title', this.name);

    // create steps
    let steps = this.store.createRecord('array');
    set(this, 'steps', steps);
    set(this, 'steps.length', 8);

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
    set(this, 'readPortsGroup', readPorts);
    this.addValueInPort('0', 'indexInPort', { canBeEmpty: true });
    this.addValueOutPort('0', 'getValue', true);

    this.addNumberSetting('read ports', 'readPortsGroup.portSetsCount', this, { minValue: 1, maxValue: 4 });
    set(readPorts, 'portSetsCount', 2);

    this.requestSave();
  },

  ready() {
    if (!this.isNew) {
      get(this, 'steps').dataManager = this;
    }
  },

  remove() {
    get(this, 'steps').remove();
    this._super();
  },

  save() {
    get(this, 'steps').save();
    this._super();
  }

});
