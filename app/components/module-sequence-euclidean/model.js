import Ember from 'ember';
import DS from 'ember-data';
import ModuleSequence from '../module-sequence/model';

const {
  get,
  set
} = Ember;

const {
  belongsTo
} = DS;

export default ModuleSequence.extend({

  type: 'module-sequence-euclidean', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  stepsInPort: belongsTo('port-value-in', { async: false }),
  pulsesInPort: belongsTo('port-value-in', { async: false }),

  ready() {
    this._super();
    if (get(this, 'isNew')) {
      set(this, 'title', 'Euclidean');

      // unlike the parent, we want length to be a port instead of a setting
      this.removeSetting('Length');

      // add a sequence length port instead
      this.addValueInPort('steps', 'stepsInPort', { defaultValue: 8, minValue: 0, maxValue: 128, isEnabled: true });
      this.addValueInPort('pulses', 'pulsesInPort', { defaultValue: 0, minValue: 0, maxValue: 128, isEnabled: true });

      // event to trigger euclid calculation
      this.addEventInPort('update', 'updateSequence', true);

      set(this, 'inputType', 'Button');

      this.requestSave();
    }
  },

  updateSequence() {
    let stepCount = get(this, 'stepsInPort').getValue();
    let pulseCount = get(this, 'pulsesInPort').getValue();

    // calculate euclidean pattern
    let pattern = this.getPattern(pulseCount, stepCount);

    // update the sequence length
    set(this, 'steps.length', stepCount);

    // for each sequence step, update the value to match the calculated pattern
    get(this, 'steps.items').forEach(function(item) {
      let i = get(item, 'index');
      let value = pattern[i] == 0 ? null : 1;
      set(item, 'value', value);
    });
  },

  // from https://github.com/mkontogiannis/euclidean-rhythms/blob/master/src/index.js
  getPattern(pulses, steps) {
    pulses = Math.min(pulses, steps);

    // Create the two arrays
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
      for (let x = 0; x < minLength; x++) {
        first[x] = Array.prototype.concat.call(first[x], second[x]);
      }

      // if the second was the bigger array, slice the remaining elements/arrays and update
      if (minLength === firstLength) {
        second = Array.prototype.slice.call(second, minLength);
      }
      // Otherwise update the second (smallest array) with the remainders of the first
      // and update the first array to include only the extended sub-arrays
      else {
        second = Array.prototype.slice.call(first, minLength);
        first = Array.prototype.slice.call(first, 0, minLength);
      }
      firstLength = first.length;
      minLength = Math.min(firstLength, second.length);
    }

    // Build the final array
    let pattern = [];
    first.forEach((f) => {
      pattern = Array.prototype.concat.call(pattern, f);
    });
    second.forEach((s) => {
      pattern = Array.prototype.concat.call(pattern, s);
    });

    return pattern;
  }

});
