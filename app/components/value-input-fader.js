import Ember from 'ember';
import XRangeInputComponent from 'emberx-range-input/components/x-range-input';

//fader depends on rangeslider.js so that the vertical slider can have custom styles
//not possible with chrome html5 range input

export default XRangeInputComponent.extend({

  attributeBindings: ['data-orientation', 'noValue:disabled'],
  'data-orientation': 'vertical',

  noValue: Ember.computed.empty('value'),

  didInsertElement() {
    this._super();
    if (this.get('type') === 'range') {
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
    }
  },

  willDestroyElement() {
    this.$().rangeslider('destroy');
    this._super();
  }

});
