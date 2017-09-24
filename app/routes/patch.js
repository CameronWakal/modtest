import Ember from 'ember';

const {
  Route,
  set,
  get
} = Ember;

export default Route.extend({

  afterModel(patch) {
    // TODO as of Ember Data 2.14, seems the patch hasMany modules relationship resolves
    // 'successfully' as an empty array when changing routes. I haven't figured out the
    // cause yet. For now I'm reloading the new patch when the route changes :(
    if (!get(patch, 'isNew')) {
      return patch.reload().then(function(patch) {
        return get(patch, 'modules');
      });
    }
  },

  actions: {
    willTransition(transition) {
      if (transition.targetName === 'index') {
        this.replaceWith('patch', this.controller.model);
      }
    },
    didTransition() {
      set(this.controllerFor('application'), 'currentPatch', this.controller.model);
    }
  }

});
