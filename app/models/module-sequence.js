import Ember from 'ember';
import DS from 'ember-data';
import Module from './module';

export default Module.extend({
  
  length: DS.attr('number', { defaultValue: 16 }),
  steps: DS.hasMany('module-sequence-step'),
  currentStep: DS.belongsTo('module-sequence-step', {async:false}),

  incrementStep() {

    let currentStep = this.get('currentStep');
    let nextIndex = 0;
    var currentIndex;

    if(currentStep !== null) {
      currentIndex = currentStep.get('index');
      if( currentIndex <= this.get('length')-1 ) {
        nextIndex = currentIndex+1;
      }
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
    this.addPort('event', 'destination', 'inc step');
    this.addPort('value', 'source', 'value');
    this.addPort('event', 'source', 'trig');

    this.save();
  },

  deleteRecord() {
    this.destroyPorts();
    this.get('steps').forEach(function(step){
      step.destroyRecord();
    });
    this._internalModel.deleteRecord();
  },

});
