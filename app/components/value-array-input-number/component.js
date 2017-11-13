import { get } from '@ember/object';
import ValueInputNumber from '../value-input-number/component';

// like ValueInputNumber, but meant to be used as one of many inputs in an array:
// - can be styled based on whether it's the currently active item in the series
// - supports shortcuts to shift or modify all items in the array
// - supports key events to navigate focus between items in the array

export default ValueInputNumber.extend({

  classNames: ['value-array-input-number'],
  classNameBindings: ['item.isCurrentItem:current'],

  selectNext() {
    if (this.$().next().length) {
      this.$().next().focus();
    } else {
      this.$().siblings().first().focus();
    }
  },

  selectPrevious() {
    if (this.$().prev().length) {
      this.$().prev().focus();
    } else {
      this.$().siblings().last().focus();
    }
  },

  keyUp(event) {

    switch (event.keyCode) {
      case 37: // left arrow
        this.$().select();
        break;
      case 39: // right arrow
        this.$().select();
        break;
      default:
        this._super(event);
    }
  },

  keyDown(event) {

    switch (event.keyCode) {
      case 37: // left arrow
        if (event.shiftKey) {
          this.updateValue();
          get(this, 'item.array').shiftForward();
        }
        this.selectPrevious();
        break;
      case 39: // right arrow
        if (event.shiftKey) {
          this.updateValue();
          get(this, 'item.array').shiftBackward();
        }
        this.selectNext();
        break;
      case 38: // up arrow
        if (event.shiftKey) {
          this.updateValue();
          get(this, 'item.array').incrementAll();
        } else {
          this.incrementProperty('value');
          this.updateValue();
        }
        break;
      case 40: // down arrow
        if (event.shiftKey) {
          this.updateValue();
          get(this, 'item.array').decrementAll();
        } else {
          this.decrementProperty('value');
          this.updateValue();
        }
        break;
      default:
        this._super(event);
    }
  }

});
