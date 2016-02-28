import Ember from 'ember';
import DS from 'ember-data';
import Module from './module';

export default Module.extend({
  
  label: 'Sequence',
  defaultSequenceLength: 8, 
  
  //todo: cleaner way? would this work as a computed FindBy rather than a separate relationship?
  sequenceLengthSetting: DS.belongsTo('module-setting', {async: false}),
  sequenceLength: Ember.computed.alias('sequenceLengthSetting.value'),
  onSequenceLengthChanged: Ember.observer('sequenceLengthSetting.value', function() {
    if(this.get('steps')) {
      this.get('steps').changeLength(this.get('sequenceLength'));
    }
  }),

  steps: DS.belongsTo('array', {async: false}),
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
    //create settings
    let setting = this.store.createRecord('module-setting', {key:'sequenceLength', label:'Length', value:this.get('defaultSequenceLength')});
    this.get('settings').pushObject(setting);
    this.set('sequenceLengthSetting', setting);

    //create steps
    let steps = this.store.createRecord('array', {module:this});
    steps.changeLength(this.get('defaultSequenceLength'));
    this.set('steps', steps);

    //create ports
    this.addEventInPort('inc step', 'incrementStep');
    this.addValueOutPort('value', 'getValue');
    this.addEventOutPort('trig', 'trigOutPort');
  },

});
