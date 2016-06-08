import DS from 'ember-data';
import Module from '../module/model';

export default Module.extend({
  
  label: 'Sequence', 

  steps: DS.belongsTo('array', {async: false}),
  trigOutPort: DS.belongsTo('port-event-out', {async:false}),
  inputType: DS.attr('string', {defaultValue:'Number'}),
  displayScale: DS.attr('number', {defaultValue:1}),

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

  reset() {
    this.set('steps.currentItem', null);
  },

  didCreate() {
    //create steps
    let steps = this.store.createRecord('array', {module:this});
    this.set('steps', steps);
    this.set('steps.length', 8);

    //create settings
    this.addMenuSetting('Input Type', 'inputType', this, ['Number', 'Slider', 'Both']);

    //todo: make config option for settings that must have a non-null numeric value
    this.addNumberSetting('Length', 'steps.length', this);
    this.addNumberSetting('Input Min', 'steps.valueMin', this);
    this.addNumberSetting('Input Max', 'steps.valueMax', this);
    this.addNumberSetting('Input Step', 'steps.valueStep', this);
    this.addNumberSetting('Display Scale', 'displayScale', this);

    //create ports
    this.addEventInPort('inc', 'incrementStep', true);
    this.addEventInPort('reset', 'reset', false);
    this.addValueOutPort('value', 'getValue', true);
    this.addEventOutPort('trig', 'trigOutPort', false);

    this.save();
  },

  remove() {
    this.get('steps').remove();
    this._super();
  }

});
