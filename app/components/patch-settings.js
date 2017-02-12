import Ember from 'ember';

export default Ember.Component.extend({

  actions: {
    removePatch() {
      this.sendAction('removePatch');
    },
    titleChanged() {
      this.sendAction('patchTitleChanged');
    }
  }

});
