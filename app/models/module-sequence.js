import DS from 'ember-data';
import Module from './module';

export default Module.extend({
  
  length: DS.attr('number', { defaultValue: 16 }),
  steps: DS.hasMany('module-sequence-step'),
  currentStep: DS.belongsTo('module-sequence-step', {async:false}),

  trigOutPort: DS.belongsTo('port-event-out', {async:false}),

  getValue() {
    return this.get('currentStep.value');
  },

  incrementStep(event) {
    let step = this.get('currentStep');
    let index = this.get('currentStep.index');
    let length = this.get('length');
    let steps = this.get('steps');
    var nextStep;

    //update step
    if(!step) {
      nextStep = steps.findBy('index', 0);
    } else if(index < length-1) {
      nextStep = steps.findBy('index', index+1);
    } else {
      nextStep = steps.findBy('index', 0);
    }
    this.set('currentStep', nextStep);

    //output event if current step has a value
    if( !isNaN( parseInt( this.get('currentStep.value') ) ) ) {
      this.get('trigOutPort').sendEvent(event);
    }
  },

  didCreate() {
    //create steps
    let stepCount = this.get('length');
    var step;
    for(var i = 0; i < stepCount; i++) {
      step = this.store.createRecord('module-sequence-step', {sequence:this, index:i});
    }
    //create ports
    this.addEventInPort('inc step', 'incrementStep');
    this.addValueOutPort('value', 'getValue');
    this.addEventOutPort('trig', 'trigOutPort');
  },

});
