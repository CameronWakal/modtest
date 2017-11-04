import Component from '@ember/component';

export default Component.extend({

  actions: {
    removePatch() {
      this.sendAction('removePatch');
    },
    titleChanged() {
      this.sendAction('patchTitleChanged');
    }
  }

});
