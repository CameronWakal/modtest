import Ember from 'ember';

const {
  Component,
  get,
  set
} = Ember;

// todo: generalize patch-menu and select-menu to be a single component
export default Component.extend({

  tagName: 'select',
  attributeBindings: ['name'],

  change() {
    let selectedIndex = this.$('option:selected').index();
    let items = get(this, 'items');
    set(this, 'selectedItem', items[selectedIndex]);
  }

});
