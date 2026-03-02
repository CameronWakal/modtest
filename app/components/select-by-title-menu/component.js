import Component from '@glimmer/component';
import { action } from '@ember/object';

// todo: generalize patch-menu and select-menu to be a single component
export default class SelectByTitleMenuComponent extends Component {
  @action
  handleChange(event) {
    let { selectedIndex } = event.target;
    let items = this.args.items?.slice() ?? [];
    let selectedItem = items[selectedIndex];
    // Don't set selectedItem locally - let the parent handle state via itemSelected action
    // The parent's computed property will update based on the action's side effects
    if (this.args.itemSelected) {
      this.args.itemSelected(selectedItem);
    }
  }
}
