import Ember from 'ember';

export default Ember.TextField.extend({

  classNames: ['value-input'],
  classNameBindings: ['valueInput.isCurrentInput:current'],

  focusIn() {
    this.$().select();
  },

  focusOut() {
    let value = parseInt( this.get('value') );
    if(isNaN(value)) {
      this.set('value', null);
    } else {
      this.set('value', value);
    }
    this.get('valueInput.array.module').save();
  },

});
