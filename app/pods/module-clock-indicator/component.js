import Ember from 'ember';

const {
  Component,
  computed,
  get,
  set,
  String,
  observer,
  run
} = Ember;

export default Component.extend({

  classNames: ['module-clock-indicator'],

  tickDuration: 0,
  latestTargetTime: null,
  countIsEven: true,

  // dom child elements
  evenLamp: null,
  oddLamp: null,
  lamps: null,

  didInsertElement() {
    this.lamps = this.$().find('.lamp');
    this.evenLamp = this.$().find('.evenLamp');
    this.oddLamp = this.$().find('.oddLamp');
  },

  onTickDurationChanged: observer('tickDuration', function() {
    this.lamps.css('animation-duration', get(this, 'tickDuration') + 'ms');
  }),

  onLatestTargetTimeChanged: observer('latestTargetTime', function() {
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
