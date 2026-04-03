import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PatchRoute extends Route {
  @service store;
  @service currentPatch;
  @service autoSave;
  @service router;

  async model({ patch_id }) {
    // First check if the patch exists in the store (may have been loaded via findAll)
    let patch = this.store.peekRecord('patch', patch_id);
    if (patch) {
      return patch;
    }

    // Try to load from database - if not found, adapter will throw
    return this.store.findRecord('patch', patch_id);
  }

  @action
  willTransition(transition) {
    if (transition.targetName === 'index') {
      this.replaceWith('patch', this.modelFor('patch'));
    }
  }

  @action
  didTransition() {
    const patch = this.modelFor('patch');
    this.currentPatch.patch = patch;
    this.autoSave.setCurrentPatch(patch.id);
  }

  @action
  error(error) {
    // If patch not found, redirect to application route which will create/select a patch
    if (error.message && error.message.includes('not found')) {
      this.router.replaceWith('application');
      return false; // Prevent error from bubbling
    }
    // Let other errors bubble up
    return true;
  }
}
