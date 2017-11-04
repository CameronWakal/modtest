import Controller from '@ember/controller';

export default Controller.extend({

  currentPatch: null,

  actions: {
    patchChanged(newPatch) {
      this.send('patchChangedFromController', newPatch);
    }
  }

});
