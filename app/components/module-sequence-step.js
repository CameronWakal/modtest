import Ember from 'ember';

export default Ember.TextField.extend({

  classNames: ['module-sequence-step'],
  classNameBindings: ['input.isCurrentInput:current'],

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
    this.get('input.array.module').save();
  },

  keyDown(event) {
    
  }

});
