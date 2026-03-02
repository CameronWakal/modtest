import { action } from '@ember/object';
import { set } from '@ember/object';
import BaseValueInputComponent from '../base-value-input/component';

/**
 * Numeric input for use in arrays. Extends BaseValueInputComponent.
 * Additional features:
 * - Styled based on whether it's the currently active item
 * - Arrow key navigation between items in the array
 * - Shift+arrow shortcuts for array-wide operations
 */
export default class ValueArrayInputNumberComponent extends BaseValueInputComponent {
  selectNext() {
    if (this._inputElement?.nextElementSibling) {
      this._inputElement.nextElementSibling.focus();
    } else if (this._inputElement?.parentElement?.firstElementChild) {
      this._inputElement.parentElement.firstElementChild.focus();
    }
  }

  selectPrevious() {
    if (this._inputElement?.previousElementSibling) {
      this._inputElement.previousElementSibling.focus();
    } else if (this._inputElement?.parentElement?.lastElementChild) {
      this._inputElement.parentElement.lastElementChild.focus();
    }
  }

  @action
  handleKeyUp(event) {
    switch (event.keyCode) {
      case 13: // enter/return
      case 27: // escape
      case 37: // left arrow
      case 38: // up arrow
      case 39: // right arrow
      case 40: // down arrow
        this._inputElement?.select();
        break;
    }
  }

  @action
  handleKeyDown(event) {
    console.log('keycode:', event.keyCode);

    switch (event.keyCode) {
      case 13: // enter/return
        this.updateValue();
        break;
      case 27: // escape
        this.resetValue();
        break;
      case 37: // left arrow
        if (event.shiftKey) {
          this.updateValue();
          this.args.item?.array?.shiftForward();
        }
        this.selectPrevious();
        break;
      case 39: // right arrow
        if (event.shiftKey) {
          this.updateValue();
          this.args.item?.array?.shiftBackward();
        }
        this.selectNext();
        break;
      case 38: // up arrow
        if (event.shiftKey) {
          this.updateValue();
          this.args.item?.array?.incrementAll();
        } else {
          this.value = (parseInt(this.value) || 0) + 1;
          this.updateValue();
        }
        break;
      case 40: // down arrow
        if (event.shiftKey) {
          this.updateValue();
          this.args.item?.array?.decrementAll();
        } else {
          this.value = (parseInt(this.value) || 0) - 1;
          this.updateValue();
        }
        break;
    }
  }

  // Override to update the item's value directly
  commitValue(value) {
    if (this.args.item) {
      set(this.args.item, 'value', value);
    } else if (this.args.onChange) {
      this.args.onChange(value);
    } else {
      set(this.args, 'boundValue', value);
    }
  }
}
