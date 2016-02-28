import Ember from 'ember';

//todo: refactor this and value-input to a common component?
//todo: only update sequence length on focusOut
export default Ember.TextField.extend({

  classNames: ['setting-input'],

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
  },

});
