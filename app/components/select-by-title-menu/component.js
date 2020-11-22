import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SelectByTitleMenu extends Component {

  @action
  change(event) {
    let selectedIndex = event.target.selectedIndex;
    let items = this.args.items.toArray();
    let selectedItem = items[selectedIndex];
    this.args.itemSelected(selectedItem);
  }

}
