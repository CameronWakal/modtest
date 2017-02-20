import Ember from 'ember';

const {
  Controller
} = Ember;

export default Controller.extend({

  currentPatch: null,

  actions: {
    patchChanged(newPatch) {
      this.send('patchChangedFromController', newPatch);
    }
  }

});
