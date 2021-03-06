import Component from '@ember/component';
import { set, get } from '@ember/object';

// todo: generalize patch-menu and select-menu to be a single component
export default Component.extend({

  tagName: 'select',
  attributeBindings: ['name'],

  change() {
    let { selectedIndex } = this.element;
    let items = this.items;
    set(this, 'selectedItem', items[selectedIndex]);
  }

});
