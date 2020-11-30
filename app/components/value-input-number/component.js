import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

// from template:
// boundValue – external, persisted value, as opposed to current <input> value
// canBeEmpty
// minValue
// maxValue

export default class ValueInputNumber extends Component {

  @tracked value;
  @tracked isPending = false;

  constructor() {
    super(...arguments);
    this.value = this.args.boundValue;
  };

  @action
  boundValueChanged(element, [boundValue]) {
    this.updateValue(boundValue);
  };

  updateValue(inputValue) {
    let value = parseInt(inputValue);

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

    this.value = value;
    if( this.value !== this.args.boundValue) {
      this.isPending = true;
    }
  };

  commitValue() {
    this.args.valueChanged(this.value);
    this.isPending = false;
  };

  resetValue() {
    this.value = this.args.boundValue;
    this.isPending = false;
  };

  click(event) {
    event.target.select();
  };

  @action
  focusOut() {
    this.commitValue();
  };

  @action
  input(event) {
    this.updateValue(event.target.value);
  };

  @action
  keyUp(event) {

    switch (event.keyCode) {
      case 13: // enter/return
        event.target.select();
        break;
      case 27: // escape
        event.target.select();
        break;
      case 38: // up arrow
        event.target.select();
        break;
      case 40: // down arrow
        event.target.select();
    }
  };

  @action
  keyDown(event) {
    console.log('keycode:', event.keyCode);

    switch (event.keyCode) {
      case 13: // enter/return
        this.commitValue();
        break;
      case 27: // escape
        this.resetValue();
        break;
      case 38: // up arrow
        this.updateValue(this.value + 1);
        this.commitValue();
        break;
      case 40: // down arrow
        this.updateValue(this.value - 1);
        this.commitValue();
    }
  }

}
