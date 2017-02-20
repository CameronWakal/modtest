import Ember from 'ember';

const {
  Component,
  get,
  set
} = Ember;

export default Component.extend({

  tagName: 'select',
  attributeBindings: ['name'],

  change() {
    let selectedIndex = this.$('option:selected').index();
    let items = get(this, 'setting.items').toArray();
    let selectedItem = items[selectedIndex];
    set(this, 'setting.selectedItem', selectedItem);
    set(this, 'setting.value', get(selectedItem, 'value'));
  }

});
