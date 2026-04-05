import Component from '@glimmer/component';

// renders a series of value inputs.
// depending on inputType, could be a numeric input field, a slider, or both.

export default class ValueInputArrayComponent extends Component {
  get isTypeNumber() {
    return this.args.inputType === 'Number';
  }

  get isTypeSlider() {
    return this.args.inputType === 'Slider';
  }

  get isTypeBoth() {
    return this.args.inputType === 'Both';
  }

  get isTypeButton() {
    return this.args.inputType === 'Button';
  }

  get shouldIncludeNumber() {
    return this.isTypeNumber || this.isTypeBoth;
  }

  get shouldIncludeSlider() {
    return this.isTypeSlider || this.isTypeBoth;
  }

  get arrayClasses() {
    const classes = ['value-input-array'];
    if (this.isTypeBoth) classes.push('value-input-array--number-slider');
    return classes.join(' ');
  }
}
