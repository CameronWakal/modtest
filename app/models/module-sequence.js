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

});
