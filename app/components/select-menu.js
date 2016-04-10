import Ember from 'ember';

export default Ember.Component.extend({

  tagName: 'select',
  attributeBindings: ['name'],

  change() {
    const selectedIndex = this.$('option:selected').index();
    const items = this.get('items').toArray();
    const selectedItem = items[selectedIndex];
    this.set('selectedItem', selectedItem);
  },

});
