import Ember from 'ember';

const {
  Component,
  computed
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
    return this.get('item.value') === this.get('max');
  }),

  click(event) {
    let value = this.get('item.value');
    let max = this.get('max');
    let min = this.get('min');

    if (event.shiftKey) {
      if (value === max) {
        this.set('item.value', null);
      } else {
        this.set('item.value', max);
      }
    } else {
      if (value === null) {
        this.set('item.value', min);
      } else {
        this.set('item.value', null);
      }
    }
  }

});
