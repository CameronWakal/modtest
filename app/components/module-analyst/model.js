import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  get,
  set
} = Ember;

const {
  belongsTo
} = DS;

const maxValues = 8;

export default Module.extend({

  type: 'module-value', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Analyst',

  valueInPort: belongsTo('port-value-in', { async: false }),
  values: [],

  addValue() {
    let newValue = get(this, 'valueInPort').getValue();
    if (newValue != null) {
      this.values.push(newValue);
      if (this.values.length > maxValues) {
        this.values.shift();
      }
    }
    console.log('values', this.values);
  },

  ready() {
    if (get(this, 'isNew')) {
      set(this, 'title', this.name);
      // create ports
      this.addEventInPort('in', 'addValue', false);
      this.addValueInPort('value', 'valueInPort', { isEnabled: false });
      console.log('module-value didCreate saveLater');
      this.requestSave();
    }
  }

});
