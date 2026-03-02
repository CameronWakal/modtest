/*
  So this route does two slightly weird things.
  - it always redirects into a patch route no matter what. When arriving at this
  route you will redirect to the first patch in the list, and if there are no
  patches, one will be created.
  - it manually updates a currentPatch variable on the application controller.
  This is so that a select menu in the application template can show which
  patch is currently selected.
*/

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class ApplicationRoute extends Route {
  @service store;
  @service midi;
  @service scheduler;
  @service router;

  constructor() {
    super(...arguments);
    this.midi.setup();
    this.scheduler.setup();
  }

  async model() {
    // Pre-load all module types into the store
    // With polymorphic relationships, each type is stored separately in localforage
    await Promise.all([
      this.store.findAll('module-sequence'),
      this.store.findAll('module-sequence-euclidean'),
      this.store.findAll('module-bus'),
      this.store.findAll('module-clock'),
      this.store.findAll('module-clock-div'),
      this.store.findAll('module-in'),
      this.store.findAll('module-out'),
      this.store.findAll('module-ccout'),
      this.store.findAll('module-scale'),
      this.store.findAll('module-array'),
      this.store.findAll('module-switch'),
      this.store.findAll('module-maybe'),
      this.store.findAll('module-mute'),
      this.store.findAll('module-value'),
      this.store.findAll('module-repeat'),
      this.store.findAll('module-analyst'),
      this.store.findAll('module-analyst-graphable'),
      this.store.findAll('module-button'),
      this.store.findAll('module-merge-voices'),
      this.store.findAll('module-plonkmap'),
      this.store.findAll('module-graph'),
    ]);
    return this.store.findAll('patch');
  }

  activate() {
    this.loadDefaultPatch();
  }

  @action
  newPatch() {
    let patch = this.store.createRecord('patch', { _needsInit: true });
    this.router.transitionTo('patch', patch);
    set(this.controllerFor('application'), 'currentPatch', patch);
  }

  @action
  patchChangedFromController(newPatch) {
    this.router.transitionTo('patch', newPatch);
  }

  // when the current patch is about to be deleted, it asks the application
  // router to navigate to a different patch of its choosing
  @action
  transitionFromPatch(patch) {
    let patches = this.modelFor('application');
    let patchesList = patches.slice();
    let index = patchesList.indexOf(patch);

    if (patchesList.length <= 1) {
      // make a new patch if we're transitioning from the only patch
      let newPatch = this.store.createRecord('patch', { _needsInit: true });
      newPatch.save();
      this.router.transitionTo('patch', newPatch);
      set(this.controllerFor('application'), 'currentPatch', newPatch);
    } else if (index === 0) {
      // if we're transitioning from the first patch, go to the next patch
      this.router.transitionTo('patch', patchesList[1]);
      set(this.controllerFor('application'), 'currentPatch', patchesList[1]);
    } else {
      // otherwise, go to the previous patch
      this.router.transitionTo('patch', patchesList[index - 1]);
      set(this.controllerFor('application'), 'currentPatch', patchesList[index - 1]);
    }
  }

  // when arriving at the index route, transition to the first patch in the list,
  // or a new patch if the list is empty.
  loadDefaultPatch() {
    if (this.modelFor('patch') == null) {
      // if no patch is selected
      if (isEmpty(this.modelFor('application'))) {
        // add a patch to the list if there are none
        let patch = this.store.createRecord('patch', { _needsInit: true });
        patch.save();
        this.router.replaceWith('patch', patch);
        set(this.controllerFor('application'), 'currentPatch', patch);
      } else {
        // if there are patches in the list, transition to the first one
        let patches = this.modelFor('application');
        let patchesList = patches.slice();
        this.router.replaceWith('patch', patchesList[0]);
      }
    } else {
      // patch route still has a model from before we hit the browser back button
      this.router.replaceWith('patch', this.modelFor('patch'));
    }
    // set currentPatch on app controller so it can init dropdown patch menu
    set(this.controllerFor('application'), 'currentPatch', this.modelFor('patch'));
  }
}
