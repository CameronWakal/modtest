import { action } from '@ember/object';
import BaseValueInputComponent from '../base-value-input/component';

/**
 * Numeric input component with increment/decrement via arrow keys.
 * Extends BaseValueInputComponent for shared value handling logic.
 */
export default class ValueInputNumberComponent extends BaseValueInputComponent {
  @action
  handleKeyUp(event) {
    switch (event.keyCode) {
      case 13: // enter/return
      case 27: // escape
      case 38: // up arrow
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
      case 38: // up arrow
        this.value = (parseInt(this.value) || 0) + 1;
        this.updateValue();
        break;
      case 40: // down arrow
        this.value = (parseInt(this.value) || 0) - 1;
        this.updateValue();
        break;
    }
  }
}
