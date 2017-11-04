import Component from '@ember/component';
import { set, get } from '@ember/object';

// todo: generalize patch-menu and select-menu to be a single component
export default Component.extend({

  tagName: 'select',
  attributeBindings: ['name'],

  change() {
    let selectedIndex = this.$('option:selected').index();
    let patches = get(this, 'patches').toArray();
    let selectedPatch = patches[selectedIndex];
    set(this, 'selectedPatch', selectedPatch);
    this.sendAction('patchChanged', selectedPatch);
  }

});
