import Ember from 'ember';
import DS from 'ember-data';
import Module from './module';

export default Module.extend({
  
  length: DS.attr('number', { defaultValue: 16 }),
  steps: DS.hasMany('module-sequence-step'),
  currentStep: DS.belongsTo('module-sequence-step', {async:false}),

  currentIndex: Ember.computed.alias('currentStep.index'),
  currentValue: Ember.computed.alias('currentStep.value'),

  trigOutPort: DS.belongsTo('port-event-out', {async:false}),

  incrementStep() {
    let currentStep = this.get('currentStep');
    let currentIndex = this.get('currentIndex');
    let length = this.get('length');
    let nextIndex = 0;

    if(currentStep && currentIndex <= length-1 ) {
        nextIndex = currentIndex+1;
    }

    let nextStep = this.get('steps').findBy('index', nextIndex);
    this.set('currentStep', nextStep);
  },

  didCreate() {
    //create steps
    let stepCount = this.get('length');
    var step;
    for(var i = 0; i < stepCount; i++) {
      step = this.store.createRecord('module-sequence-step', {sequence:this, index:i});
      step.save();
    }
    //create ports
    this.addEventInPort('inc step', 'incrementStep');
    this.addValueOutPort('value', 'currentValue');
    this.addEventOutPort('trig', 'trigOutPort');

    this.save();
  },

  deleteRecord() {
    //currently all member models are destroyed immediately
    //would be better but more complex to handle destruction/deletion/saving
    //for member models?
    this.get('steps').forEach(function(step){
      step.destroyRecord();
    });

    this._super();
  },

});
