import TextField from '@ember/component/text-field';
import { set, get, computed, observer } from '@ember/object';

// from template:
// boundValue – external, persisted value, as opposed to current <input> value
// canBeEmpty
// minValue
// maxValue

export default TextField.extend({

  classNames: ['value-input-number'],
  classNameBindings: ['isPending:pending'],

  isPending: computed('value', 'boundValue', function() {
    let value = parseInt(this.value);
    if (isNaN(value)) {
      value = null;
    }
    return value !== this.boundValue;
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
    let value = parseInt(this.value);

    if (isNaN(value)) {
      // if new value is NaN, set boundValue to null or boundValue,
      // depending on canBeEmpty flag
      if (this.canBeEmpty) {
        value = null;
      } else {
        value = this.boundValue;
      }
    } else {
      // if new value is a number, make sure it's within min/max
      if (this.minValue != null) {
        value = Math.max(this.minValue, value);
      }
      if (this.maxValue != null) {
        value = Math.min(this.maxValue, value);
      }
    }
    set(this, 'value', value);
    set(this, 'boundValue', value);
  },

  resetValue() {
    let value = this.boundValue;
    set(this, 'value', value);
  },

  keyUp(event) {

    switch (event.keyCode) {
      case 13: // enter/return
        this.element.select();
        break;
      case 27: // escape
        this.element.select();
        break;
      case 38: // up arrow
        this.element.select();
        break;
      case 40: // down arrow
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
        break;
      case 38: // up arrow
        this.incrementProperty('value');
        this.updateValue();
        break;
      case 40: // down arrow
        this.decrementProperty('value');
        this.updateValue();
    }
  }

});
