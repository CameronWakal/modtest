import { tracked } from '@glimmer/tracking';
import { belongsTo, attr } from '@ember-data/model';
import Module from '../module/model';

const inputTypeMenuOptions = ['Number', 'Slider', 'Both', 'Button'];

export default class ModuleSequenceModel extends Module {
  type = 'module-sequence'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Sequence';
  inputTypeMenuOptions = inputTypeMenuOptions;
  @tracked latestTriggerTime = null;
  @tracked triggerDuration = null;
  @tracked currentIndex = null;

  @belongsTo('array', { async: false, inverse: null }) steps;
  @belongsTo('port-event-out', { async: false, inverse: null }) trigOutPort;
  @attr('string', { defaultValue: 'Number' }) inputType;
  @attr('number', { defaultValue: 1 }) displayScale;

  // currentIndexes is referenced by the steps array to highlight the currently selected
  // steps in the UI. A sequence only ever has one selected step.
  get currentIndexes() {
    return [this.currentIndex];
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    // Ensure dataManager is set for loaded records
    if (this.steps) {
      this.steps.dataManager = this;
    }
  }

  configure() {
    // Create steps
    let steps = this.store.createRecord('array');
    this.steps = steps;
    this.steps.setLength(8);

    // Create settings
    this.addMenuSetting('Input Type', 'inputType', 'inputTypeMenuOptions', this);
    this.addNumberSetting('Length', 'steps.length', this, { minValue: 1, maxValue: 64 });
    this.addNumberSetting('Input Min', 'steps.valueMin', this);
    this.addNumberSetting('Input Max', 'steps.valueMax', this);
    this.addNumberSetting('Input Step', 'steps.valueStep', this, { minValue: 1 });
    this.addNumberSetting('Display Scale', 'displayScale', this, { minValue: 1 });

    // Create ports
    this.addEventInPort('inc', 'incrementStep', true);
    this.addEventInPort('reset', 'reset', false);
    this.addValueOutPort('value', 'getValue', true);
    this.addEventOutPort('trig', 'trigOutPort', false);
  }

  getValue() {
    let item = this.steps.items.find(i => i.index === this.currentIndex);
    if (item) {
      return item.value;
    }
    return null;
  }

  incrementStep(event) {
    // Update step
    if (this.currentIndex == null) {
      this.currentIndex = 0;
    } else if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex = this.currentIndex + 1;
    } else {
      this.currentIndex = 0;
    }

    // Output event if current step has a value
    let step = this.steps.items.find(i => i.index === this.currentIndex);
    if (!isNaN(parseInt(step.value))) {
      if (this.trigOutPort.isConnected) {
        this.trigOutPort.sendEvent(event);
        this.triggerDuration = event.duration;
        this.latestTriggerTime = event.targetTime;
      }
    }
  }

  reset() {
    this.currentIndex = null;
  }

  remove() {
    // Embedded records (steps) are removed automatically with the parent module
    super.remove();
  }
}
