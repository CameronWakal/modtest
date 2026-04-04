import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service store;
  @service router;
  @service currentPatch;

  get patches() {
    return this.model;
  }

  @action
  patchChanged(newPatch) {
    this.router.transitionTo('patch', newPatch);
  }

  @action
  newPatch() {
    let patch = this.store.createRecord('patch', { _needsInit: true });
    this.router.transitionTo('patch', patch);
    this.currentPatch.patch = patch;
  }
}
