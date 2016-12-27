import Ember from 'ember';

const {
  Controller
} = Ember;

export default Controller.extend({

  actions: {

    removeCurrentPatch() {
      let modules = this.model.get('modules');
      let modulesList = modules.toArray();
      this.model.destroyRecord();
      modulesList.forEach((module) => {
        module.remove();
      });
      this.transitionToRoute('index');
    }

  }

});
