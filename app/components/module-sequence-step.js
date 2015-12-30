import Ember from 'ember';

export default Ember.TextField.extend({

  classNames: ['module-sequence-step'],
  classNameBindings: ['step.isCurrentStep:current'],

  focusIn() {
    this.$().select();
  },

  focusOut() {
    this.get('step.sequence').save();
  }

});
