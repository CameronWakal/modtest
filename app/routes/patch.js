import Route from '@ember/routing/route';
import { action, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PatchRoute extends Route {
  @service store;

  model({ patch_id }) {
    return this.store.findRecord('patch', patch_id);
  }

  @action
  willTransition(transition) {
    if (transition.targetName === 'index') {
      this.replaceWith('patch', this.controller.model);
    }
  }

  @action
  didTransition() {
    set(this.controllerFor('application'), 'currentPatch', this.controller.model);
  }
}
