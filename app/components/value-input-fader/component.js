import { empty } from '@ember/object/computed';
import Component from '@ember/component';
import { computed, set } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({

  classNames: ['value-input-fader'],
  classNameBindings: [
    'noValue:no-value',
    'item.isCurrentItem:current'
  ],
  attributeBindings: ['inlineStyles:style'],

  noValue: empty('item.value'),
  inlineStyles: computed('displayScale', 'min', 'max', 'step', function() {
    let range = this.max - this.min;
    let steps = range / this.step;
    let height = steps * this.displayScale;
    return htmlSafe(`height:${height}px`);
  }),

  actions: {
    updateValue(value) {
      set(this, 'item.value', value);
    }
  }

});
