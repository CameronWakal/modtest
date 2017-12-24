import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({

  classNames: ['indicator-blinking'],
  classNameBindings: ['animationClass'],
  attributeBindings: ['styleAttribute:style'],

  blinkDuration: 200,
  blinkTrigger: null,
  countIsEven: true,

  init() {
    // prevent lamps from initially blinking when revisiting an already-loaded patch route
    set(this, 'blinkTrigger', null);
    this._super(...arguments);
  },

  animationClass: computed('blinkTrigger', function() {
    if (get(this, 'blinkTrigger')) {
      this.countIsEven = !this.countIsEven;
      return this.countIsEven ? 'on-even' : 'on-odd';
    }
  }),

  styleAttribute: computed('blinkDuration', function() {
    return htmlSafe(`animation-duration: ${get(this, 'blinkDuration')}ms;`);
  })

});
