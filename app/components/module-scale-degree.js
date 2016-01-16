import Ember from 'ember';

export default Ember.TextField.extend({

  classNames: ['module-scale-degree'],

  focusIn() {
    this.$().select();
  },

  focusOut() {
    this.get('degree.scale').save();
  }

});
