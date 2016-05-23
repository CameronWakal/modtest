import DS from 'ember-data';
import Ember from 'ember';
import Module from '../module/model';

export default Module.extend({
  
  label: 'Sequence', 

  steps: DS.belongsTo('array', {async: false}),
  trigOutPort: DS.belongsTo('port-event-out', {async:false}),
  lengthSetting: DS.belongsTo('module-setting-number', {async:false}),

  //for faders
  inputTypeSetting: DS.belongsTo('module-setting-menu', {async:false}),
  inputMinSetting: DS.belongsTo('module-setting-number', {async:false}),
  inputMaxSetting: DS.belongsTo('module-setting-number', {async:false}),
  inputStepSetting: DS.belongsTo('module-setting-number', {async:false}),

  inputType: Ember.computed.alias('inputTypeSetting.value'),
  inputMin: Ember.computed.alias('inputMinSetting.value'),
  inputMax: Ember.computed.alias('inputMaxSetting.value'),
  inputStep: Ember.computed.alias('inputStepSetting.value'),

  onLengthSettingChanged: Ember.observer('lengthSetting.value', function() {
    let value = parseInt(this.get('lengthSetting.value'));
    if(value !== null && !isNaN(value) ) {
      this.set('steps.length', value);
    }
  }),

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

    //create settings
    this.addNumberSetting('Length', 'lengthSetting', 8);

    //for faders
    this.addMenuSetting('Input Type', 'inputTypeSetting', ['Number', 'Slider', 'Both'], 'Number');
    this.addNumberSetting('Input Min', 'inputMinSetting', 0);
    this.addNumberSetting('Input Max', 'inputMaxSetting', 127);
    this.addNumberSetting('Input Step', 'inputStepSetting', 1);

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
