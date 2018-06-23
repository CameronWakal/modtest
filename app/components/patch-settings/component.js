import Component from '@ember/component';
import { get } from '@ember/object';

export default Component.extend({

  actions: {
    removePatch() {
      this.removePatch();
    },
    titleChanged() {
      this.patchTitleChanged();
    }
  }

});
