import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  observer,
  get,
  set
} = Ember;

const {
  belongsTo,
  attr
} = DS;

export default Module.extend({

  type: 'module-sequence', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Sequence',

  steps: belongsTo('array', { async: false }),
  trigOutPort: belongsTo('port-event-out', { async: false }),
  inputType: attr('string', { defaultValue: 'Number' }),
  displayScale: attr('number', { defaultValue: 1 }),

  getValue() {
    return get(this, 'steps.currentItem.value');
  },

  incrementStep(event) {
    let step = get(this, 'steps.currentItem');
    let index = get(this, 'steps.currentItem.index');
    let length = get(this, 'steps.length');
    let steps = get(this, 'steps.items');
    let nextStep;

    // update step
    if (!step) {
      nextStep = steps.findBy('index', 0);
    } else if (index < length - 1) {
      nextStep = steps.findBy('index', index + 1);
    } else {
      nextStep = steps.findBy('index', 0);
    }
    set(this, 'steps.currentItem', nextStep);

    // output event if current step has a value
    if (!isNaN(parseInt(get(this, 'steps.currentItem.value')))) {
      get(this, 'trigOutPort').sendEvent(event);
    }
  },

  reset() {
    set(this, 'steps.currentItem', null);
  },

  ready() {
    if (get(this, 'isNew')) {
      // create steps
      let steps = this.store.createRecord('array', { module: this });
      set(this, 'steps', steps);
      set(this, 'steps.length', 8);

      // create settings
      this.addMenuSetting('Input Type', 'inputType', this, ['Number', 'Slider', 'Both', 'Button']);

      // todo: make config option for settings that must have a non-null numeric value
      this.addNumberSetting('Length', 'steps.length', this);
      this.addNumberSetting('Input Min', 'steps.valueMin', this);
      this.addNumberSetting('Input Max', 'steps.valueMax', this);
      this.addNumberSetting('Input Step', 'steps.valueStep', this);
      this.addNumberSetting('Display Scale', 'displayScale', this);

      // create ports
      this.addEventInPort('inc', 'incrementStep', true);
      this.addEventInPort('reset', 'reset', false);
      this.addValueOutPort('value', 'getValue', true);
      this.addEventOutPort('trig', 'trigOutPort', false);

      this.requestSave();
    }
  },

  remove() {
    get(this, 'steps').remove();
    this._super();
  },

  onAttrChanged: observer('inputType', 'displayScale', function() {
    if (get(this, 'hasDirtyAttributes')) {
      this.requestSave();
    }
  }),

  save() {
    get(this, 'steps').save();
    this._super();
  }

});
