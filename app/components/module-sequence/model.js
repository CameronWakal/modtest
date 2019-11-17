import { set, get, observer, computed } from '@ember/object';
import DS from 'ember-data';
import Module from '../module/model';

const {
  belongsTo,
  attr
} = DS;

const inputTypeMenuOptions = ['Number', 'Slider', 'Both', 'Button'];

export default Module.extend({

  type: 'module-sequence', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Sequence',
  inputTypeMenuOptions,
  latestTriggerTime: null,
  triggerDuration: null,

  steps: belongsTo('array', { async: false, inverse: null }),
  trigOutPort: belongsTo('port-event-out', { async: false }),
  inputType: attr('string', { defaultValue: 'Number' }),
  displayScale: attr('number', { defaultValue: 1 }),

  onAttrChanged: observer('inputType', 'displayScale', function() {
    if (get(this, 'hasDirtyAttributes')) {
      this.requestSave();
    }
  }),

  // currentIndexes is referenced by the steps array to highlight the currently selected
  // steps in the UI. A sequence only ever has one selected step.
  currentIndexes: computed('currentIndex', function() {
    return [this.currentIndex];
  }),
  currentIndex: null,

  getValue() {
    let item = this.steps.items.findBy('index', this.currentIndex);
    if (item) {
      return item.value;
    }
    return null;
  },

  incrementStep(event) {

    // update step
    if (this.currentIndex == null) {
      set(this, 'currentIndex', 0);
    } else if (this.currentIndex < this.steps.length - 1) {
      set(this, 'currentIndex', this.currentIndex + 1);
    } else {
      set(this, 'currentIndex', 0);
    }

    // output event if current step has a value
    let step = this.steps.items.findBy('index', this.currentIndex);
    if (!isNaN(parseInt(step.value))) {
      if (this.trigOutPort.isConnected) {
        this.trigOutPort.sendEvent(event);
        set(this, 'triggerDuration', event.duration);
        set(this, 'latestTriggerTime', event.targetTime);
      }
    }
  },

  reset() {
    set(this, 'currentIndex', null);
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

      // create ports
      this.addEventInPort('inc', 'incrementStep', true);
      this.addEventInPort('reset', 'reset', false);
      this.addValueOutPort('value', 'getValue', true);
      this.addEventOutPort('trig', 'trigOutPort', false);

      this.requestSave();

      get(this, 'steps').dataManager = this;
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
