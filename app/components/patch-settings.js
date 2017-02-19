import Ember from 'ember';

const {
  Component
} = Ember;

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
