import Ember from 'ember';

//renders a series of value inputs.
//depending on inputType, could be a numeric input field, a slider, or both. 

export default Ember.Component.extend({

  classNames: ['value-input-array'],

  isTypeNumber: Ember.computed.equal('inputType', 'Number'),
  isTypeSlider: Ember.computed.equal('inputType', 'Slider'),
  isTypeBoth: Ember.computed.equal('inputType', 'Both'),
  isTypeButton: Ember.computed.equal('inputType', 'Button'),

  shouldIncludeNumber: Ember.computed.or('isTypeNumber', 'isTypeBoth'),
  shouldIncludeSlider: Ember.computed.or('isTypeSlider', 'isTypeBoth')

});
