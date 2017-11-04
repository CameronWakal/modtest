import Controller from '@ember/controller';
import { get } from '@ember/object';

export default Controller.extend({

  actions: {
    removePatch() {
      // first, give application route a chance to navigate away from the current patch
      this.send('transitionFromPatch', this.model);

      let modules = get(this, 'model.modules');
      let modulesList = modules.toArray();
      this.model.destroyRecord();
      modulesList.forEach((module) => {
        module.remove();
      });
    }
  }

});
