import Ember from 'ember';

export default Ember.TextField.extend({

  classNames: ['module-sequence-step'],

  onEvent: 'focusIn',
  focusIn() {
    this.$().select();
  }

});
