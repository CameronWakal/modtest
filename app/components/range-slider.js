import Ember from 'ember';
import XRangeInputComponent from 'emberx-range-input/components/x-range-input';

//emberx-range-input CLI addon for a range input component,
//polyfilled by rangeslider.js so the slider can be both vertical AND have custom styles

export default XRangeInputComponent.extend({

  attributeBindings: ['data-orientation'],
  'data-orientation': 'vertical',

  onValueChanged: Ember.observer('value', function(){
    console.log('value changed to', this.get('value'));
    this.$().val(this.get('value')).change();
  }),

  onSettingsChanged: Ember.observer('min', 'max', 'step', function(){
    this.$().rangeslider('update', true);
  }),

  didInsertElement() {
    this._super();
    var self = this;
    self.$().rangeslider({
      polyfill: false,
      onInit: function() {
          self.sendAction('onInit');
      },
      onSlide: function(position, value) {
          self.set('value', value);
          self.sendAction('onSlide', position, value);
      },
      onSlideEnd: function(position, value) {
          self.set('value', value);
          self.sendAction('onSlideEnd', position, value);
      },
    });
  },

  willDestroyElement() {
    this.$().rangeslider('destroy');
    this._super();
  }

});
