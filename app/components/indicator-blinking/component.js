import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({

  classNames: ['indicator-blinking'],
  classNameBindings: ['animationClass'],
  attributeBindings: ['styleAttribute:style'],

  blinkDuration: 200,
  blinkTrigger: null,
  countIsEven: true,

  animationClass: computed('blinkTrigger', function() {
    if (get(this, 'blinkTrigger')) {
      this.countIsEven = !this.countIsEven;
      return this.countIsEven ? 'on-even' : 'on-odd';
    }
  }),

  styleAttribute: computed('blinkDuration', function() {
    return new htmlSafe(`animation-duration: ${get(this, 'blinkDuration')}ms;`);
  })

});
