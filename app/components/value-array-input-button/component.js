import { notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import { set, get, computed } from '@ember/object';

export default Component.extend({

  classNames: ['value-array-input-button'],
  tagName: 'button',
  classNameBindings: [
    'isOn:on',
    'isAccented:accent',
    'item.isCurrentItem:current'
  ],

  isOn: notEmpty('item.value'),
  isAccented: computed('item.value', 'max', function() {
    return get(this, 'item.value') === this.max;
  }),

  click(event) {
    let value = get(this, 'item.value');
    let max = this.max;
    let min = this.min;

    if (event.shiftKey) {
      if (value === max) {
        set(this, 'item.value', null);
      } else {
        set(this, 'item.value', max);
      }
    } else {
      if (value === null) {
        set(this, 'item.value', min);
      } else {
        set(this, 'item.value', null);
      }
    }
  }

});
