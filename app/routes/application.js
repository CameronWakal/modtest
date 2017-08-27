/*
  So this route does two slightly weird things.
  - it always redirects into a patch route no matter what. When arriving at this
  route you will redirect to the first patch in the list, and if there are no
  patches, one will be created.
  - it manually updates a currentPatch variable on the application controller.
  This is so that a select menu in the application template can show which
  patch is currently selected.
*/

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

    // TODO as of Ember Data 2.14, attempting to load modules in the aftermodel hook
    // upon changing patches seems to have stopped working. Haven't found the fix yet,
    // this hack-around is to load ALL MODULES for all patches during the application
    // model hook. Pretty crappy solution...
    return this.store.findAll('patch').then(function(patches){
      patches.forEach(function(patch){
        get(patch, 'modules')
      });
      return patches;
    });
  },

  midi: inject.service(),
  scheduler: inject.service(),

  init() {
    get(this, 'midi').setup();
    get(this, 'scheduler').setup();
    this._super(...arguments);
  },

  activate() {
    this.loadDefaultPatch();
  },

  // when arriving at the index route, transition to the first patch in the list,
  // or a new patch if the list is empty.
  loadDefaultPatch() {
    if (this.modelFor('patch') == null) {
      // if no patch is selected
      if (isEmpty(this.modelFor('application'))) {
        // add a patch to the list if there are none
        let patch = this.store.createRecord('patch');
        patch.save();
        this.replaceWith('patch', patch);
        set(this.controllerFor('application'), 'currentPatch', patch);
      } else {
        // if there are patches in the list, transition to the first one
        let patches = this.modelFor('application');
        let patchesList = patches.toArray();
        this.replaceWith('patch', patchesList[0]);
      }
    } else {
      // patch route still has a model from before we hit the browser back button
      this.replaceWith('patch', this.modelFor('patch'));
    }
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

    patchChangedFromController(newPatch) {
      this.transitionTo('patch', newPatch);
    },

    // when the current patch is about to be deleted, it asks the application
    // router to navigate to a different patch of its choosing
    transitionFromPatch(patch) {
      let patches = this.modelFor('application');
      let patchesList = patches.toArray();
      let index = patchesList.indexOf(patch);

      if (patchesList.length <= 1) {
        // make a new patch if we're transitioning from the only patch
        let patch = this.store.createRecord('patch');
        patch.save();
        this.transitionTo('patch', patch);
        set(this.controllerFor('application'), 'currentPatch', patch);
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
