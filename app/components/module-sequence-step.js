import Ember from 'ember';

export default Ember.TextField.extend({

  classNames: ['module-sequence-step'],
  classNameBindings: ['step.isCurrentStep:current'],

  onEvent: 'focusIn',
  focusIn() {
    this.$().select();
  },

  onEvent: 'focusOut',
  focusOut() {
    this.get('step').save();
  }

});
