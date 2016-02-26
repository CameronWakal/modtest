import DS from 'ember-data';
import Module from './module';

export default Module.extend({
  
  sequenceLength: 16,

  steps: DS.belongsTo('array'),
  trigOutPort: DS.belongsTo('port-event-out', {async:false}),

  getValue() {
    return this.get('steps.currentItem.value');
  },

  incrementStep(event) {
    let input = this.get('steps.currentItem');
    let index = this.get('steps.currentItem.index');
    let length = this.get('steps.length');
    let inputs = this.get('steps.items');
    var nextInput;

    //update step
    if(!input) {
      nextInput = inputs.findBy('index', 0);
    } else if(index < length-1) {
      nextInput = inputs.findBy('index', index+1);
    } else {
      nextInput = inputs.findBy('index', 0);
    }
    this.set('steps.currentItem', nextInput);

    //output event if current step has a value
    if( !isNaN( parseInt( this.get('steps.currentItem.value') ) ) ) {
      this.get('trigOutPort').sendEvent(event);
    }
  },

  didCreate() {
    //create steps
    let steps = this.store.createRecord('array', {module:this, length:this.get('sequenceLength')});
    this.set('steps', steps);
    steps.initItems();

    //create ports
    this.addEventInPort('inc step', 'incrementStep');
    this.addValueOutPort('value', 'getValue');
    this.addEventOutPort('trig', 'trigOutPort');
  },

});
