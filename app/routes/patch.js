import Ember from 'ember';

const {
  Route,
  set
} = Ember;

export default Route.extend({

  afterModel(patch) {
    return patch.get('modules');
  },

  actions: {
    willTransition(transition) {
      if(transition.targetName === 'index') {
        this.replaceWith('patch', this.controller.model);
      }
    },
    didTransition() {
      set(this.controllerFor('application'), 'currentPatch', this.controller.model);
    }
  }

});
