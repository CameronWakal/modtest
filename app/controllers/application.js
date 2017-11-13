import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  currentPatch: null,
  patches: alias('model'),

  actions: {
    patchChanged(newPatch) {
      this.send('patchChangedFromController', newPatch);
    }
  }

});
