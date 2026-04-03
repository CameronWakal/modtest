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
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class ApplicationRoute extends Route {
  @service store;
  @service midi;
  @service scheduler;
  @service router;
  @service currentPatch;
  @service autoSave;

  constructor() {
    super(...arguments);
    this.midi.setup();
    this.scheduler.setup();
  }

  async model() {
    // Load all patches from IndexedDB
    // The adapter deserializes complete documents, so all embedded records
    // (modules, ports, settings) are created automatically
    await this.store.findAll('patch');

    // Return all patches from the store
    return this.store.peekAll('patch');
  }

  activate() {
    this.loadDefaultPatch();
  }

  // when the current patch is about to be deleted, it asks the application
  // router to navigate to a different patch of its choosing
  @action
  async transitionFromPatch(patch) {
    let patches = this.modelFor('application');
    let patchesList = patches.slice();
    let index = patchesList.indexOf(patch);

    if (patchesList.length <= 1) {
      // make a new patch if we're transitioning from the only patch
      let newPatch = this.store.createRecord('patch', { _needsInit: true });
      this.autoSave.setCurrentPatch(newPatch.id);
      await newPatch.save();
      this.router.transitionTo('patch', newPatch);
      this.currentPatch.patch = newPatch;
    } else if (index === 0) {
      // if we're transitioning from the first patch, go to the next patch
      this.autoSave.setCurrentPatch(patchesList[1].id);
      this.router.transitionTo('patch', patchesList[1]);
      this.currentPatch.patch = patchesList[1];
    } else {
      // otherwise, go to the previous patch
      this.autoSave.setCurrentPatch(patchesList[index - 1].id);
      this.router.transitionTo('patch', patchesList[index - 1]);
      this.currentPatch.patch = patchesList[index - 1];
    }
  }

  // when arriving at the index route, transition to the first patch in the list,
  // or a new patch if the list is empty.
  async loadDefaultPatch() {
    if (this.modelFor('patch') == null) {
      // if no patch is selected
      if (isEmpty(this.modelFor('application'))) {
        // add a patch to the list if there are none
        let patch = this.store.createRecord('patch', { _needsInit: true });
        this.autoSave.setCurrentPatch(patch.id);
        await patch.save();
        this.router.replaceWith('patch', patch);
        this.currentPatch.patch = patch;
      } else {
        // if there are patches in the list, transition to the first one
        let patches = this.modelFor('application');
        let patchesList = patches.slice();
        this.autoSave.setCurrentPatch(patchesList[0].id);
        this.router.replaceWith('patch', patchesList[0]);
      }
    } else {
      // patch route still has a model from before we hit the browser back button
      let patch = this.modelFor('patch');
      this.autoSave.setCurrentPatch(patch.id);
      this.router.replaceWith('patch', patch);
    }
    // set currentPatch on service so the dropdown patch menu can use it
    this.currentPatch.patch = this.modelFor('patch');
  }
}
