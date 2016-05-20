import Ember from 'ember';

//fader depends on rangeslider.js so that the vertical slider can have custom styles
//not possible with chrome html5 range input

export default Ember.Component.extend({

  classNames: ['value-input-fader'],

  onRangeUpdated: Ember.observer('min', 'max', 'step', function() {
    console.log('range updated', this.get('min'), this.get('max'), this.get('step'));
    this.$('input[type="range"]').rangeslider('update', true);
  }),

  mouseDown(event) {
    console.log('fader mousedown!');
    //event.preventDefault();
    //this.$().focus();
    //Ember.$(document).on('mouseup', this.mouseUpBody.bind(this));
    //return false;
  },

  mouseMove(event) {
    console.log('fader mousemove!');
    //return false;
  },

  mouseUp(event) {
    console.log('fader mouseup!');
    console.log('value:', this.$('input[type="range"]')[0].value);
  },

  didInsertElement() {
    console.log('inserted slider!');
    this.$('input[type="range"]').rangeslider({

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
          console.log('rangeslider onInit!');
        },

        // Callback function
        onSlide: function(position, value) {
          console.log('rangeslider onSlide!', position, value);
        },

        // Callback function
        onSlideEnd: function(position, value) {
          console.log('rangeslider onSlideEnd!');
        }
        
    });
  },

  willDestroyElement() {
    console.log('destroying slider!');
    this.$('input[type="range"]').rangeslider('destroy');
  }

});
