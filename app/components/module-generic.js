import Ember from 'ember';

export default Ember.Component.extend({

  actions: {
    removeSelf() {
      this.sendAction('removeModule', this.get('model'));
    },
  },
  
});
