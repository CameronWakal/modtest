import Ember from 'ember';

const {
  Controller
} = Ember;

export default Controller.extend({

  actions: {
    removePatch() {
      // first, give application route a chance to navigate away from the current patch
      this.send('transitionFromPatch', this.model);
      
      let modules = this.model.get('modules');
      let modulesList = modules.toArray();
      this.model.destroyRecord();
      modulesList.forEach((module) => {
        module.remove();
      });
    }
  }

});
