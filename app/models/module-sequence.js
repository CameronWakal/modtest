import DS from 'ember-data';
import Module from './module';

export default Module.extend({
  
  sequenceLength: 16,

  inputArray: DS.belongsTo('array'),
  trigOutPort: DS.belongsTo('port-event-out', {async:false}),

  getValue() {
    return this.get('inputArray.currentItem.value');
  },

  incrementStep(event) {
    let input = this.get('inputArray.currentItem');
    let index = this.get('inputArray.currentItem.index');
    let length = this.get('inputArray.length');
    let inputs = this.get('inputArray.items');
    var nextInput;

    //update step
    if(!input) {
      nextInput = inputs.findBy('index', 0);
    } else if(index < length-1) {
      nextInput = inputs.findBy('index', index+1);
    } else {
      nextInput = inputs.findBy('index', 0);
    }
    this.set('inputArray.currentItem', nextInput);

    //output event if current step has a value
    if( !isNaN( parseInt( this.get('inputArray.currentItem.value') ) ) ) {
      this.get('trigOutPort').sendEvent(event);
    }
  },

  didCreate() {
    //create inputArray
    let inputArray = this.store.createRecord('array', {module:this, length:this.get('sequenceLength')});
    this.set('inputArray', inputArray);
    inputArray.initItems();

    //create ports
    this.addEventInPort('inc step', 'incrementStep');
    this.addValueOutPort('value', 'getValue');
    this.addEventOutPort('trig', 'trigOutPort');
  },

});
