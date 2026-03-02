import Component from '@glimmer/component';
import { action } from '@ember/object';
import { set } from '@ember/object';

export default class ValueArrayInputButtonComponent extends Component {
  get isOn() {
    return this.args.item?.value != null;
  }

  get isAccented() {
    return this.args.item?.value === this.args.max;
  }

  @action
  handleClick(event) {
    let value = this.args.item?.value;
    let max = this.args.max;
    let min = this.args.min;

    if (event.shiftKey) {
      if (value === max) {
        set(this.args.item, 'value', null);
      } else {
        set(this.args.item, 'value', max);
      }
    } else {
      if (value === null) {
        set(this.args.item, 'value', min);
      } else {
        set(this.args.item, 'value', null);
      }
    }
  }
}
