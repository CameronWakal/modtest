import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  
  value: DS.attr('number'),
  index: DS.attr('number'),
  sequence: DS.belongsTo('module-sequence', {async:false, inverse:'steps'}),

  isCurrentStep: Ember.computed('sequence.currentStep', function(){
    return this === this.get('sequence.currentStep');
  })

});
