import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PatchRoute extends Route {
  @service store;
  @service currentPatch;

  model({ patch_id }) {
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
    this.currentPatch.patch = this.modelFor('patch');
  }
}
