import Ember from 'ember';

export default Ember.TextField.extend({

  classNames: ['module-scale-degree'],
  classNameBindings: ['degree.isCurrentDegree:current'],

  focusIn() {
    this.$().select();
  },

  focusOut() {
    this.get('degree.scale').save();
  },

});
