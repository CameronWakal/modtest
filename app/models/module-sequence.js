import DS from 'ember-data';
import Module from './module';

export default Module.extend({
  
  inputArray: DS.belongsTo('inputArray'),
  trigOutPort: DS.belongsTo('port-event-out', {async:false}),

  getValue() {
    return this.get('inputArray.currentInput.value');
  },

  incrementStep(event) {
    let input = this.get('inputArray.currentInput');
    let index = this.get('inputArray.currentInput.index');
    let length = this.get('inputArray.length');
    let inputs = this.get('inputArray.inputs');
    var nextInput;

    //update step
    if(!input) {
      nextInput = inputs.findBy('index', 0);
    } else if(index < length-1) {
      nextInput = inputs.findBy('index', index+1);
    } else {
      nextInput = inputs.findBy('index', 0);
    }
    this.set('inputArray.currentInput', nextInput);

    //output event if current step has a value
    if( !isNaN( parseInt( this.get('inputArray.currentInput.value') ) ) ) {
      this.get('trigOutPort').sendEvent(event);
    }
  },

  didCreate() {
    //create inputArray
    this.set('inputArray', this.store.createRecord('inputArray', {module:this}));

    //create steps
    let inputCount = this.get('inputArray.length');
    var input;
    for(var i = 0; i < inputCount; i++) {
      input = this.store.createRecord('input', {array:this.get('inputArray'), index:i});
    }
    //create ports
    this.addEventInPort('inc step', 'incrementStep');
    this.addValueOutPort('value', 'getValue');
    this.addEventOutPort('trig', 'trigOutPort');
  },

});
