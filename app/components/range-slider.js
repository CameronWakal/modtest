import Ember from 'ember';
import XRangeInputComponent from 'emberx-range-input/components/x-range-input';

//emberx-range-input CLI addon for a range input component,
//polyfilled by rangeslider.js so the slider can be both vertical AND have custom styles

export default XRangeInputComponent.extend({

  attributeBindings: ['data-orientation'],
  'data-orientation': 'vertical',

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
