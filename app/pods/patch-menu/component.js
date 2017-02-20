import Ember from 'ember';

const {
  Component
} = Ember;

export default Component.extend({

  tagName: 'select',
  attributeBindings: ['name'],

  change() {
    let selectedIndex = this.$('option:selected').index();
    let patches = this.get('patches').toArray();
    let selectedPatch = patches[selectedIndex];
    this.set('selectedPatch', selectedPatch);
    this.sendAction('patchChanged', selectedPatch);
  }

});
