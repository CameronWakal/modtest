import Ember from 'ember';

export default Ember.TextField.extend({

  classNames: ['value-input'],
  classNameBindings: ['item.isCurrentItem:current'],

  focusIn() {
    this.$().select();
  },

  focusOut() {
    let intValue = parseInt(this.get('value'));
    this.set('value', isNaN(intValue) ? null : intValue );
    
    this.get('item.array.module').save();
  },

});
