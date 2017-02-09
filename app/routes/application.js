import Ember from 'ember';

const {
  Route,
  inject,
  get,
  set,
  isEmpty
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
    if (this.modelFor('patch') == null) {
      // if no patch is selected
      if (isEmpty(this.modelFor('application'))) {
        // add a patch to the list if there are none
        this.newPatch();
      } else {
        // if there are patches in the list, transition to the first one
        let patches = this.modelFor('application');
        let patchesList = patches.toArray();
        this.transitionTo('patch', patchesList[0]);
      }
    }
    // set currentPatch on app controller so it can init dropdown patch menu
    set(this.controllerFor('application'), 'currentPatch', this.modelFor('patch'));
  },

  newPatch() {
    let patch = this.store.createRecord('patch');
    patch.save();
    this.transitionTo('patch', patch);
    set(this.controllerFor('application'), 'currentPatch', patch);
  },

  actions: {
    newPatch() {
      this.newPatch();
    },
    patchChangedFromController(newPatch) {
      this.transitionTo('patch', newPatch);
    },
    // called before current patch is deleted, so app can decide where to navigate
    transitionFromPatch(patch) {
      let patches = this.modelFor('application');
      let patchesList = patches.toArray();
      let index = patchesList.indexOf(patch);

      if (patchesList.length <= 1) {
        // make a new patch if we're transitioning from the only patch
        this.newPatch();
      } else if (index == 0) {
        // if we're transitioning from the first patch, go to the next patch
        this.transitionTo('patch', patchesList[1]);
        set(this.controllerFor('application'), 'currentPatch', patchesList[1]);
      } else {
        // otherwise, go to the previous patch
        this.transitionTo('patch', patchesList[index - 1]);
        set(this.controllerFor('application'), 'currentPatch', patchesList[index - 1]);
      }
    }
  }
});
