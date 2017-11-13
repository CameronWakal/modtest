import { equal, or } from '@ember/object/computed';
import Component from '@ember/component';

// renders a series of value inputs.
// depending on inputType, could be a numeric input field, a slider, or both.

export default Component.extend({

  classNames: ['value-input-array'],

  isTypeNumber: equal('inputType', 'Number'),
  isTypeSlider: equal('inputType', 'Slider'),
  isTypeBoth: equal('inputType', 'Both'),
  isTypeButton: equal('inputType', 'Button'),

  shouldIncludeNumber: or('isTypeNumber', 'isTypeBoth'),
  shouldIncludeSlider: or('isTypeSlider', 'isTypeBoth')

});
