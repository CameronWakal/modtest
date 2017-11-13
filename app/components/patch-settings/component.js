import Component from '@ember/component';
import { get } from '@ember/object';

export default Component.extend({

  actions: {
    removePatch() {
      get(this, 'removePatch')();
    },
    titleChanged() {
      get(this, 'patchTitleChanged')();
    }
  }

});
