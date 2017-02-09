import Ember from 'ember';

export default Ember.Controller.extend({

  currentPatch: null,

  actions: {
    patchChanged(newPatch) {
      this.send('patchChangedFromController', newPatch);
    }
  }

});
