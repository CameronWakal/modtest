import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['module-sequence-step'],
  classNameBindings: ['isSelected:selected'],

  isSelected: Ember.computed.alias('step.isSelected'),

  click() {
    console.log('------ sequence step component sending select action');
    this.attrs.select();
  }

});
