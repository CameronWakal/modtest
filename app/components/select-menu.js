import Ember from 'ember';

const {
  Component
} = Ember;

export default Component.extend({

  tagName: 'select',
  attributeBindings: ['name'],

  change() {
    let selectedIndex = this.$('option:selected').index();
    let items = this.get('setting.items').toArray();
    let selectedItem = items[selectedIndex];
    this.set('setting.selectedItem', selectedItem);
    this.set('setting.value', selectedItem.get('value'));
  }

});
