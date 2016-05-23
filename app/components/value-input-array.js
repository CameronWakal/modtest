import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['value-input-array'],

  isTypeNumber: Ember.computed.equal('inputType', 'Number'),
  isTypeSlider: Ember.computed.equal('inputType', 'Slider'),
  isTypeBoth: Ember.computed.equal('inputType', 'Both'),

  shouldIncludeNumber: Ember.computed.or('isTypeNumber', 'isTypeBoth'),
  shouldIncludeSlider: Ember.computed.or('isTypeSlider', 'isTypeBoth'),

});
