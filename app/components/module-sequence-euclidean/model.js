import Ember from 'ember';
import DS from 'ember-data';
import ModuleSequence from '../module-sequence/model';

const {
  get,
  set,
  observer
} = Ember;

const {
  attr,
  belongsTo
} = DS;

export default ModuleSequence.extend({

  type: 'module-sequence-euclidean', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Euclidean Sequence',

  stepsInPort: belongsTo('port-value-in', { async: false }),
  pulsesInPort: belongsTo('port-value-in', { async: false }),

  ready() {
    this._super();
    if (get(this, 'isNew')) {

      // remove the sequence length setting from the super component
      let settings  = get(this, 'settings');
      let lengthSetting = settings.findBy('label', 'Length');
      settings.removeObject(lengthSetting);
      this.store.findRecord('module-setting', lengthSetting.id, { backgroundReload: false }).then(function(lengthSetting) {
        lengthSetting.destroyRecord();
      });

      // add a sequence length port instead
      this.addValueInPort('steps', 'stepsInPort', { defaultValue: 12, minValue: 0, maxValue: 128, isEnabled: false });
      this.addValueInPort('pulses', 'pulsesInPort', { defaultValue: 7, minValue: 0, maxValue: 128, isEnabled: false });

      // event to trigger euclid calculation
      this.addEventInPort('reset', 'resetSequence', true);

      // set the sequence input to buttons by default
      set(this, 'inputType', 'Button');

      this.requestSave();
    }
  },

  resetSequence() {
    let steps = get(this, 'stepsInPort').getValue();
    let pulses = get(this, 'pulsesInPort').getValue();
    set(this, 'steps.length', steps);

    console.log('pattern', this.getPattern(pulses, steps));
  },

  // based on https://github.com/mkontogiannis/euclidean-rhythms/blob/master/src/index.js
  getPattern(pulses, steps) {
    pulses = Math.min(pulses, steps);

    // Create two arrays
    let first = new Array(pulses).fill([1]);
    let second = new Array(steps - pulses).fill([0]);

    let firstLength = first.length;
    let minLength = Math.min(firstLength, second.length);

    let loopThreshold = 0;
    // Loop until at least one array has length gt 2 (1 for first loop)
    while (minLength > loopThreshold) {
    	// Allow only loopThreshold to be zero on the first loop
    	if (loopThreshold === 0) {
    		loopThreshold = 1;
    	}

    	// For the minimum array loop and concat
      for (var x = 0; x < minLength; x++) {
        first[x] = Array.prototype.concat.call(first[x], second[x]);
      }

      // if the second was the bigger array, slice the remaining elements/arrays and update
      if (minLength === firstLength) {
      	second = Array.prototype.slice.call(second, minLength);
      }
      // Otherwise update the second (smallest array) with the remainders of the first
      // and update the first array to include onlt the extended sub-arrays
      else {
        second = Array.prototype.slice.call(first, minLength);
        first = Array.prototype.slice.call(first, 0, minLength);
      }
      firstLength = first.length;
      minLength = Math.min(firstLength, second.length);
  	}

  	// Build the final array
    let pattern = [];
    first.forEach(f => {
      pattern = Array.prototype.concat.call(pattern, f);
    });
    second.forEach(s => {
      pattern = Array.prototype.concat.call(pattern, s);
    });

    return pattern;
  }

});
