import Ember from 'ember';

const {
  Component,
  computed,
  get,
  set
} = Ember;

export default Component.extend({

  classNames: ['value-array-input-button'],
  tagName: 'button',
  classNameBindings: [
    'isOn:on',
    'isAccented:accent',
    'item.isCurrentItem:current'
  ],

  isOn: computed.notEmpty('item.value'),
  isAccented: computed('item.value', 'max', function() {
    return get(this, 'item.value') === get(this, 'max');
  }),

  click(event) {
    let value = get(this, 'item.value');
    let max = get(this, 'max');
    let min = get(this, 'min');

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
