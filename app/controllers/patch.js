import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';

export default class PatchController extends Controller {
  @alias('model') patch;

  @action
  removePatch() {
    // first, give application route a chance to navigate away from the current patch
    this.send('transitionFromPatch', this.model);

    // Access content directly for async relationships to avoid deprecated PromiseManyArray methods
    let modules = this.patch.modules;
    let modulesArray = modules.content || modules;
    let modulesList = [...modulesArray];
    this.model.destroyRecord();
    modulesList.forEach((module) => {
      module.remove();
    });
  }
}
