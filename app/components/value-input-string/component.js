import { action } from '@ember/object';
import { set } from '@ember/object';
import { isEmpty } from '@ember/utils';
import BaseValueInputComponent from '../base-value-input/component';

/**
 * String input component. Extends BaseValueInputComponent.
 * Overrides parseValue for string handling instead of numeric.
 */
export default class ValueInputStringComponent extends BaseValueInputComponent {
  // Strings don't need parsing - return as-is
  parseValue(val) {
    return val;
  }

  get isPending() {
    return this.value !== this.args.boundValue;
  }

  updateValue() {
    let value = this.value;
    let boundValue = this.args.boundValue;

    if (value !== boundValue) {
      if (!this.args.canBeEmpty && isEmpty(value)) {
        this.value = boundValue;
      } else {
        this._lastBoundValue = value;
        this.commitValue(value);
        // Call valueUpdated callback if provided
        if (this.args.valueUpdated) {
          this.args.valueUpdated();
        }
      }
    }
  }

  commitValue(value) {
    if (this.args.onChange) {
      this.args.onChange(value);
    } else if (this.args.target && this.args.property) {
      set(this.args.target, this.args.property, value);
    } else {
      console.warn('ValueInputString: No onChange handler provided. Value updates will fail.');
    }
  }
}
