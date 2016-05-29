import Ember from 'ember';

export default Ember.Component.extend({

  tagName: 'select',
  attributeBindings: ['name'],

  change() {
    const selectedIndex = this.$('option:selected').index();
    const items = this.get('setting.items').toArray();
    const selectedItem = items[selectedIndex];
    this.set('setting.selectedItem', selectedItem);
    this.set('setting.value', selectedItem.get('value'));
  },

});
