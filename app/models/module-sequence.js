import Ember from 'ember';
import DS from 'ember-data';
import Module from './module';

export default Module.extend({
  
  length: DS.attr('number', { defaultValue: 16 }),
  steps: DS.hasMany('module-sequence-step'),
  currentStep: DS.attr('number'),

  //variable name is value, port with label value will look for it
  value: Ember.computed('steps.@each.value', 'steps.@each.index', 'currentStep', function(){
    let steps = this.get('steps');
    let step = steps.findBy('index', this.get('currentStep'));
    return step.get('value');
  }),

  didCreate() {
    console.log('sequence didCreate');

    let stepCount = this.get('length');
    var step;
    for(var i = 0; i < stepCount; i++) {
      step = this.store.createRecord('module-sequence-step', {sequence:this, index:i});
      step.save();
    }
    this.save();

  },

  destroyRecord(options) {
    console.log('sequence destroy');

    this.get('steps').forEach(function(step){
      step.destroyRecord();
    });
    this.deleteRecord();
    return this.save(options);
  
  },

  deleteRecord() {
    console.log('Warning: deleting a sequence will not delete its member models. Use destroy instead.')
    this._internalModel.deleteRecord();
  },

});
