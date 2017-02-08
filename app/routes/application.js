import Ember from 'ember';

const {
  Route,
  inject,
  get,
  set
} = Ember;

export default Route.extend({
  model() {
    return this.store.findAll('patch');
  },

  midi: inject.service(),
  scheduler: inject.service(),

  init() {
    get(this, 'midi').setup();
    get(this, 'scheduler').setup();
    this._super(...arguments);
  },

  activate() {
    // set currentPatch on app controller so it can init dropdown patch menu
    set(this.controllerFor('application'), 'currentPatch', this.modelFor('patch'));
  },

  actions: {
    newPatch() {
      let patch = this.store.createRecord('patch');
      patch.save();
      this.transitionTo('patch', patch);
      set(this.controllerFor('application'), 'currentPatch', patch);
    },
    removeCurrentPatch() {
      // TODO: when removing a patch the previous patch in the patches list should
      // get selected. Really the remove button should be within the patch controller or component,
      // the patch should remove itself, and then the application route/controller should be informed,
      // and update the patches menu.
      
      // destroy current patch including modules and ports, leave route
      let currentPatchController = this.controllerFor('patch');
      currentPatchController.send('removeCurrentPatch');
      set(this.controllerFor('application'), 'currentPatch', null);
    },
    patchControllerChanged(newPatch) {
      this.transitionTo('patch', newPatch);
    }
  }
});
