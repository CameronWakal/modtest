import Component from '@ember/component';

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
