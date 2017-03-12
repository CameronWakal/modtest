import Ember from 'ember';

const {
  Component,
  get,
  computed,
  String
} = Ember;

export default Component.extend({

  classNames: ['indicator-blinking'],
  classNameBindings: ['animationClass'],
  attributeBindings: ['styleAttribute:style'],

  animationClass: computed('blinkTrigger', function() {
    if (get(this, 'blinkTrigger')) {
      this.countIsEven = !this.countIsEven;
      return this.countIsEven ? 'on-even' : 'on-odd';
    }
  }),

  styleAttribute: computed('blinkDuration', function() {
    return new String.htmlSafe(`animation-duration: ${get(this, 'blinkDuration')}ms;`);
  }),

  blinkDuration: 200,
  blinkTrigger: null,
  countIsEven: true

});
