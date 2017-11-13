import TextField from '@ember/component/text-field';
import { set, get, computed, observer } from '@ember/object';

// from template:
// boundValue – external, persisted value, as opposed to current <input> value
// defaultValue
// canBeEmpty
// minValue
// maxValue

export default TextField.extend({

  classNames: ['value-input-number'],
  classNameBindings: ['isPending:pending'],

  isPending: computed('value', 'boundValue', function() {
    let value = parseInt(get(this, 'value'));
    if (isNaN(value)) {
      value = null;
    }
    return value !== get(this, 'boundValue');
  }),

  onBoundValueChanged: observer('boundValue', function() {
    this.resetValue();
  }),

  didReceiveAttrs() {
    this.resetValue();
  },

  click() {
    this.$().select();
  },

  focusOut() {
    this.updateValue();
  },

  updateValue() {
    let value = parseInt(get(this, 'value'));

    if (isNaN(value)) {
      // if new value is NaN, set boundValue to null or defaultValue,
      // depending on canBeEmpty flag
      if (get(this, 'canBeEmpty')) {
        value = null;
      } else {
        value = get(this, 'defaultValue');
      }
    } else {
      // if new value is a number, make sure it's within min/max
      if (get(this, 'minValue') != null) {
        value = Math.max(get(this, 'minValue'), value);
      }
      if (get(this, 'maxValue') != null) {
        value = Math.min(get(this, 'maxValue'), value);
      }
    }
    set(this, 'value', value);
    set(this, 'boundValue', value);
  },

  resetValue() {
    let value = get(this, 'boundValue');
    if (!get(this, 'canBeEmpty') && value == null) {
      value = get(this, 'defaultValue');
    }
    set(this, 'value', value);
  },

  keyUp(event) {

    switch (event.keyCode) {
      case 13: // enter/return
        this.$().select();
        break;
      case 27: // escape
        this.$().select();
        break;
      case 38: // up arrow
        this.$().select();
        break;
      case 40: // down arrow
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
