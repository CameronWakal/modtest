import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {

    removeCurrentPatch() {
      let modules = this.model.get('modules');
      let modulesList = modules.toArray();
      this.model.destroyRecord();
      modulesList.forEach( (module) => {
        module.destroyRecord();
      });
      this.transitionToRoute('index');
    },

  }

});
