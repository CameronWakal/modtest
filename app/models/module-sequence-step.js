import DS from 'ember-data';

export default DS.Model.extend({
  
  value: DS.attr('number'),
  index: DS.attr('number'),
  sequence: DS.belongsTo('module-sequence', {async:false}),

  isCurrentStep: Ember.computed('sequence.currentStep', function(){
    return this.get('index') === this.get('sequence.currentStep');
  })

});
