import Module from '../module/model';
import Ember from 'ember';
import DS from 'ember-data';

const {
  get,
  set
} = Ember;

const {
  belongsTo
} = DS;

export default Module.extend({

  type: 'module-switch', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Switch',

  in0Port: belongsTo('port-value-in', { async: false }),
  in1Port: belongsTo('port-value-in', { async: false }),
  switchInPort: belongsTo('port-value-in', { async: false }),

  getValue() {
    let switchVal = get(this, 'switchInPort').getValue();
    if (switchVal === 0) {
      return get(this, 'in0Port').getValue();
    } else if (switchVal === 1) {
      return get(this, 'in1Port').getValue();
    } else {
      return null;
    }
  },

  ready() {
    if (get(this, 'isNew')) {
      // create ports
      this.addValueInPort('in0', 'in0Port', true);
      this.addValueInPort('in1', 'in1Port', true);
      this.addValueInPort('switch', 'switchInPort', true);
      this.addValueOutPort('out', 'getValue', true);
      console.log('module-switch.didCreate() requestSave()');
      this.requestSave();
    }
  }

});
