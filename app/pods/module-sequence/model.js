import DS from 'ember-data';
import Ember from 'ember';
import Module from '../module/model';

export default Module.extend({
  
  label: 'Sequence', 

  steps: DS.belongsTo('array', {async: false}),
  trigOutPort: DS.belongsTo('port-event-out', {async:false}),

  inputTypeSetting: DS.belongsTo('module-setting-menu', {async:false}),
  inputType: Ember.computed.alias('inputTypeSetting.value'),

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
    //todo: set up the menu setting in the new reference style like module-setting-numberref
    this.addMenuSetting('Input Type', 'inputTypeSetting', ['Number', 'Slider', 'Both'], 'Number');

    //todo: make config option for settings that must have a non-null numeric value
    this.addNumberrefSetting('Length', 'steps.length', this);
    this.addNumberrefSetting('Input Min', 'steps.valueMin', this);
    this.addNumberrefSetting('Input Max', 'steps.valueMax', this);
    this.addNumberrefSetting('Input Step', 'steps.valueStep', this);

    //create ports
    this.addEventInPort('inc step', 'incrementStep');
    this.addEventInPort('reset', 'reset');
    this.addValueOutPort('value', 'getValue');
    this.addEventOutPort('trig', 'trigOutPort');

    this.save();
  },

  remove() {
    this.get('steps').remove();
    this._super();
  }

});
