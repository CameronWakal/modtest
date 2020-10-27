import TextField from '@ember/component/text-field';
import { set, get, computed, observer } from '@ember/object';
import { isEmpty } from '@ember/utils';

// from template:
// boundValue – external, persisted value, as opposed to current <input> value
// canBeEmpty

export default TextField.extend({

  classNames: ['value-input-string'],
  classNameBindings: ['isPending:pending'],

  isPending: computed('value', 'boundValue', function() {
    return this.value !== this.boundValue;
  }),

  onBoundValueChanged: observer('boundValue', function() {
    this.resetValue();
  }),

  didReceiveAttrs() {
    this.resetValue();
  },

  click() {
    this.element.select();
  },

  focusOut() {
    this.updateValue();
  },

  updateValue() {
    let value = this.value;
    let boundValue = this.boundValue;

    if (value !== boundValue) {
      if (!this.canBeEmpty && isEmpty(value)) {
        set(this, 'value', boundValue);
      } else {
        set(this, 'boundValue', value);
        this.valueUpdated();
      }
    }
  },

  resetValue() {
    set(this, 'value', this.boundValue);
  },

  keyUp(event) {

    switch (event.keyCode) {
      case 13: // enter/return
        this.element.select();
        break;
      case 27: // escape
        this.element.select();
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
