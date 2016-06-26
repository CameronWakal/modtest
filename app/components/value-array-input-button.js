import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['value-array-input-button'],
  tagName: 'button',
  classNameBindings: [
    'isOn:on',
    'isAccented:accent',
    'item.isCurrentItem:current' 
  ],

  isOn: Ember.computed.notEmpty('item.value'),
  isAccented: Ember.computed('item.value', 'max', function(){
    return this.get('item.value') === this.get('max');
  }),

  click(event) {
    const value = this.get('item.value');
    const max = this.get('max');
    const min = this.get('min');

    if(event.shiftKey) {
      if(value === max) {
        this.set('item.value', null);
      } else {
        this.set('item.value', max);
      }
    } else {
      if(value === null) {
        this.set('item.value', min);
      } else {
        this.set('item.value', null);
      }
    }
    
  }

});
