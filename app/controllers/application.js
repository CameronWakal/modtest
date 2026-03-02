import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';

export default class ApplicationController extends Controller {
  currentPatch = null;

  @alias('model') patches;

  @action
  patchChanged(newPatch) {
    this.send('patchChangedFromController', newPatch);
  }
}
