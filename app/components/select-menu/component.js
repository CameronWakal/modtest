import Component from '@glimmer/component';
import { action } from '@ember/object';
import { set } from '@ember/object';

// todo: generalize patch-menu and select-menu to be a single component
export default class SelectMenuComponent extends Component {
  @action
  handleChange(event) {
    let { selectedIndex } = event.target;
    let items = this.args.items;
    let selectedItem = items[selectedIndex];

    if (this.args.onChange) {
      this.args.onChange(selectedItem);
    } else if (this.args.target && this.args.property) {
      set(this.args.target, this.args.property, selectedItem);
    } else {
      console.warn('SelectMenu: No onChange handler provided. Value updates will fail.');
    }
  }
}
