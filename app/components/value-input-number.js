import Ember from 'ember';

export default Ember.TextField.extend({

  classNames: ['value-input-number'],
  classNameBindings:['isPending:pending'],

  isPending: Ember.computed('value', 'item.value', function(){
    return parseInt(this.get('value')) !== this.get('item.value');
  }),

  onItemValueChanged: Ember.observer('item.value', function(){
    this.resetValue();
  }),

  click() {
    this.$().select();
  },

  focusOut() {
    this.updateValue();
  },

  didReceiveAttrs() {
    this.resetValue();
  },

  updateValue() {
    let value = parseInt( this.get('value') );
    if(isNaN(value)) {
      this.set('value', null);
      this.set('item.value', null);
    } else {
      this.set('value', value);
      this.set('item.value', value);
    }
  },

  resetValue() {
    this.set('value', this.get('item.value'));
  },

  keyUp(event) {

    switch(event.keyCode) {
      case 13: //enter/return
        this.$().select();
      break;
      case 27: //escape
        this.$().select();
      break;
      case 38: //up arrow
        this.$().select();
      break;
      case 40: //down arrow
        this.$().select();

    }
  },

  keyDown(event) {
    console.log('keycode:', event.keyCode);

    switch(event.keyCode) {
      case 13: //enter/return
        this.updateValue();
      break;
      case 27: //escape
        this.resetValue();
      break;
      case 38: //up arrow
        this.incrementProperty('value');
        this.updateValue();
      break;
      case 40: //down arrow
        this.decrementProperty('value');
        this.updateValue();
    }
  }

});
