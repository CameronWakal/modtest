import DS from 'ember-data';
import Module from '../module/model';

export default Module.extend({
  
  label: 'Sequence',
  defaultLength: 8, 

  steps: DS.belongsTo('array', {async: false}),
  trigOutPort: DS.belongsTo('port-event-out', {async:false}),

  currentValue: Ember.computed.alias('steps.currentItem.value'),

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
    let setting = this.store.createRecord('module-setting', {
      label:'Length', 
      value:this.get('defaultLength'),
      module:this, 
      targetVariable:'steps.length',
    });
    this.get('settings').pushObject(setting);

    //create ports
    this.addEventInPort('inc step', 'incrementStep');
    this.addEventInPort('reset', 'reset');
    this.addValueOutPort('value', 'currentValue');
    this.addEventOutPort('trig', 'trigOutPort');
  },

  remove() {
    this.get('steps').remove();
    this._super();
  }

});
