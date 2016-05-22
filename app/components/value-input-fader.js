import Ember from 'ember';

//fader depends on rangeslider.js so that the vertical slider can have custom styles
//not possible with chrome html5 range input

export default Ember.Component.extend({
  tagName: 'input',
  attributeBindings: ['type', 'data-orientation', 'value', 'min', 'max', 'step'],
  type: 'range',
  'data-orientation': 'vertical',
  value: null,
  classNames: ['value-input-fader'],

  onRangeUpdated: Ember.observer('min', 'max', 'step', function() {
    console.log('range updated max', this.get('max'), 'attr max', this.attrs.max.value);
    this.$().rangeslider('update', true);
  }),

  didInsertElement() {
    console.log('did insert fader, value is', this.get('value'), 'max is', this.get('max'));
    let self = this;
    self.$().rangeslider({

      // Feature detection the default is `true`.
      // Set this to `false` if you want to use
      // the polyfill also in Browsers which support
      // the native <input type="range"> element.
      polyfill: false,

      // Default CSS classes
      rangeClass: 'rangeslider',
      disabledClass: 'rangeslider--disabled',
      horizontalClass: 'rangeslider--horizontal',
      verticalClass: 'rangeslider--vertical',
      fillClass: 'rangeslider__fill',
      handleClass: 'rangeslider__handle',
      
      // Callback function
      onInit: function() {
        console.log('slider init, value is', self.get('value'), 'element', self.$()[0], 'element value', self.$()[0].value, 'element max', self.$()[0].max);
      },

      // Callback function
      onSlide: function(position, value) {
        self.set('value', value);
      },

      // Callback function
      onSlideEnd: function(position, value) {

      }
        
    });
  },

  willDestroyElement() {
    this.$().rangeslider('destroy');
  }

});
