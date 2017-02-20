import Ember from 'ember';

const {
  Component,
  computed
} = Ember;

// renders a series of value inputs.
// depending on inputType, could be a numeric input field, a slider, or both.

export default Component.extend({

  classNames: ['value-input-array'],

  isTypeNumber: computed.equal('inputType', 'Number'),
  isTypeSlider: computed.equal('inputType', 'Slider'),
  isTypeBoth: computed.equal('inputType', 'Both'),
  isTypeButton: computed.equal('inputType', 'Button'),

  shouldIncludeNumber: computed.or('isTypeNumber', 'isTypeBoth'),
  shouldIncludeSlider: computed.or('isTypeSlider', 'isTypeBoth')

});
