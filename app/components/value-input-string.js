import Ember from 'ember';

const {
  TextField,
  observer,
  computed,
  get,
  set,
  isEmpty
} = Ember;

// from template:
// boundValue – external, persisted value, as opposed to current <input> value
// canBeEmpty

export default TextField.extend({

  classNames: ['value-input-string'],
  classNameBindings: ['isPending:pending'],

  isPending: computed('value', 'boundValue', function() {
    return get(this, 'value') !== get(this, 'boundValue');
  }),

  onBoundValueChanged: observer('boundValue', function() {
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
    let value = get(this, 'value');
    let boundValue = get(this, 'boundValue');

    if (value !== boundValue) {
      if (!get(this,'canBeEmpty') && isEmpty(value)) {
        set(this, 'value', boundValue);
      } else {
        set(this, 'boundValue', value);
        this.sendAction('valueUpdated');
      }
    }
  },

  resetValue() {
    set(this, 'value', get(this, 'boundValue'));
  },

  keyUp(event) {

    switch (event.keyCode) {
      case 13: // enter/return
        this.$().select();
      break;
      case 27: // escape
        this.$().select();
    }
  },

  keyDown(event) {
    console.log('keycode:', event.keyCode);

    switch (event.keyCode) {
      case 13: // enter/return
        this.updateValue();
      break;
      case 27: // escape
        this.resetValue();
    }
  }

});
