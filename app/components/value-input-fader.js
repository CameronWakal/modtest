import Component from '@glimmer/component';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default class ValueInputFaderComponent extends Component {
  get noValue() {
    return this.args.item?.value == null || this.args.item?.value === '';
  }

  get faderClasses() {
    const classes = ['value-input-fader'];
    if (this.noValue) classes.push('no-value');
    if (this.args.item?.isCurrentItem) classes.push('current');
    return classes.join(' ');
  }

  get inlineStyles() {
    let range = this.args.max - this.args.min;
    let steps = range / this.args.step;
    let height = steps * this.args.displayScale;
    return htmlSafe(`height:${height}px`);
  }

  @action
  updateValue(value) {
    this.args.item.value = value;
    // Trigger save through the array's data manager
    this.args.item.array?.requestSave();
  }
}
