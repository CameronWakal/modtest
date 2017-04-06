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
    let items = get(this, 'setting.items');
    set(this, 'setting.value', items[selectedIndex]);
  }

});
