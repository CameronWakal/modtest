import DS from 'ember-data';
import Module from './module';

export default Module.extend({
  
  label: 'Sequence',
  sequenceLength: 16,

  steps: DS.belongsTo('array'),
  trigOutPort: DS.belongsTo('port-event-out', {async:false}),

  getValue() {
    return this.get('steps.currentItem.value');
  },

  incrementStep(event) {
    let step = this.get('steps.currentItem');
    let index = this.get('steps.currentItem.index');
    let length = this.get('steps.length');
    let steps = this.get('steps.items');
    var nextStep;

    //update step
    if(!step) {
      nextStep = steps.findBy('index', 0);
    } else if(index < length-1) {
      nextStep = steps.findBy('index', index+1);
    } else {
      nextStep = steps.findBy('index', 0);
    }
    this.set('steps.currentItem', nextStep);

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
