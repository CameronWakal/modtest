import Ember from 'ember';

const {
  Route,
  inject
} = Ember;

export default Route.extend({
  model() {
    return this.store.findAll('patch');
  },

  midi: inject.service(),
  scheduler: inject.service(),

  init() {
    // initialize midi service
    this.get('midi').setup();
    this.get('scheduler').setup();
    this._super(...arguments);
  },

  actions: {
    newPatch() {
      let patch = this.store.createRecord('patch');
      patch.save();
      this.transitionTo('patch', patch);
    },
    removeCurrentPatch() {
      // destroy current patch including modules and ports, leave route
      let currentPatchController = this.controllerFor('patch');
      currentPatchController.send('removeCurrentPatch');
    }
  }
});
