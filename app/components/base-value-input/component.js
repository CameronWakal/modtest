import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { set } from '@ember/object';
import { schedule } from '@ember/runloop';

/**
 * Base class for numeric/string value input components.
 * Provides shared logic for:
 * - Two-way binding with local state sync
 * - Pending state detection
 * - Input element setup and selection
 * - Value validation and update
 */
export default class BaseValueInputComponent extends Component {
  @tracked _localValue = null;
  _lastBoundValue = undefined;
  _inputElement = null;

  get value() {
    // Sync local value from boundValue when it changes externally
    if (this.args.boundValue !== this._lastBoundValue) {
      this._lastBoundValue = this.args.boundValue;
      this._localValue = this.args.boundValue;
    }
    return this._localValue;
  }

  set value(val) {
    this._localValue = val;
  }

  get isPending() {
    let value = this.parseValue(this.value);
    return value !== this.args.boundValue;
  }

  // Override in subclasses for different parsing (e.g., string vs number)
  parseValue(val) {
    let parsed = parseInt(val);
    return isNaN(parsed) ? null : parsed;
  }

  @action
  setupInput(element) {
    this._inputElement = element;
  }

  @action
  handleClick() {
    this._inputElement?.select();
  }

  @action
  handleFocusOut() {
    // Schedule after render to avoid updating tracked state during render
    schedule('afterRender', this, this.updateValue);
  }

  @action
  handleInput(event) {
    this.value = event.target.value;
  }

  @action
  handleKeyUp(event) {
    switch (event.keyCode) {
      case 13: // enter/return
      case 27: // escape
        this._inputElement?.select();
        break;
    }
  }

  @action
  handleKeyDown(event) {
    switch (event.keyCode) {
      case 13: // enter/return
        this.updateValue();
        break;
      case 27: // escape
        this.resetValue();
        break;
    }
  }

  updateValue() {
    let value = this.parseValue(this.value);

    if (value === null) {
      // If value is null/invalid, keep current or allow empty based on canBeEmpty
      if (this.args.canBeEmpty) {
        value = null;
      } else {
        value = this.args.boundValue;
      }
    } else {
      // Apply min/max constraints
      if (this.args.minValue != null) {
        value = Math.max(this.args.minValue, value);
      }
      if (this.args.maxValue != null) {
        value = Math.min(this.args.maxValue, value);
      }
      // Also check min/max without "Value" suffix for flexibility
      if (this.args.min != null) {
        value = Math.max(this.args.min, value);
      }
      if (this.args.max != null) {
        value = Math.min(this.args.max, value);
      }
    }

    this.value = value;
    this._lastBoundValue = value;
    this.commitValue(value);
  }

  // Override in subclasses for different commit behavior
  commitValue(value) {
    if (this.args.onChange) {
      this.args.onChange(value);
    } else if (this.args.target && this.args.property) {
      // Allow passing target object and property name for direct setting
      set(this.args.target, this.args.property, value);
    } else {
      // This will fail in Glimmer - all usages should provide @onChange or @target/@property
      console.warn('ValueInput: No onChange handler provided. Value updates will fail.');
    }
  }

  resetValue() {
    this.value = this.args.boundValue;
  }
}
