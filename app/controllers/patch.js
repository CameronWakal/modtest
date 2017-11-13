import Controller from '@ember/controller';
import { get } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  patch: alias('model'),

  actions: {
    removePatch() {
      // first, give application route a chance to navigate away from the current patch
      this.send('transitionFromPatch', this.model);

      let modules = get(this, 'patch.modules');
      let modulesList = modules.toArray();
      this.model.destroyRecord();
      modulesList.forEach((module) => {
        module.remove();
      });
    }
  }

});
