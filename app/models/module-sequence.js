import DS from 'ember-data';
import Module from './module';

export default Module.extend({
  
  stepArray: DS.belongsTo('inputArray'),
  trigOutPort: DS.belongsTo('port-event-out', {async:false}),

  getValue() {
    return this.get('stepArray.currentInput.value');
  },

  incrementStep(event) {
    let input = this.get('stepArray.currentInput');
    let index = this.get('stepArray.currentInput.index');
    let length = this.get('stepArray.length');
    let inputs = this.get('stepArray.inputs');
    var nextInput;

    //update step
    if(!input) {
      nextInput = inputs.findBy('index', 0);
    } else if(index < length-1) {
      nextInput = inputs.findBy('index', index+1);
    } else {
      nextInput = inputs.findBy('index', 0);
    }
    this.set('stepArray.currentInput', nextInput);

    //output event if current step has a value
    if( !isNaN( parseInt( this.get('stepArray.currentInput.value') ) ) ) {
      this.get('trigOutPort').sendEvent(event);
    }
  },

  didCreate() {
    //create stepArray
    this.set('stepArray', this.store.createRecord('inputArray', {module:this}));

    //create steps
    let inputCount = this.get('stepArray.length');
    var input;
    for(var i = 0; i < inputCount; i++) {
      input = this.store.createRecord('input', {array:this.get('stepArray'), index:i});
    }
    //create ports
    this.addEventInPort('inc step', 'incrementStep');
    this.addValueOutPort('value', 'getValue');
    this.addEventOutPort('trig', 'trigOutPort');
  },

});
