import Ember from 'ember';

const {
  Component,
  get,
  observer,
  run
} = Ember;

export default Component.extend({

  classNames: ['indicator-blinking'],

  blinkDuration: 0,
  blinkTrigger: null,
  countIsEven: true,

  // dom child elements
  evenLamp: null,
  oddLamp: null,
  lamps: null,

  didInsertElement() {
    this.lamps = this.$().find('.lamp');
    this.evenLamp = this.$().find('.even-lamp');
    this.oddLamp = this.$().find('.odd-lamp');
    this.updateTriggerDuration();
  },

  onblinkDurationChanged: observer('blinkDuration', function() {
    this.updateTriggerDuration();
  }),

  updateTriggerDuration() {
    let duration = get(this, 'blinkDuration') ? get(this, 'blinkDuration') : 200;
    this.lamps.css('animation-duration', `${duration}ms`);
  },

  onblinkTriggerChanged: observer('blinkTrigger', function() {
    run.once(this, function() {
      if (this.countIsEven) {
        this.evenLamp.addClass('on');
        this.oddLamp.removeClass('on');
        this.countIsEven = false;
      } else {
        this.evenLamp.removeClass('on');
        this.oddLamp.addClass('on');
        this.countIsEven = true;
      }
    });
  })

});
