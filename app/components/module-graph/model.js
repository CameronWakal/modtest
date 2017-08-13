import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  observer,
  get,
  set
} = Ember;

const {
  attr,
  belongsTo
} = DS;

const latency = 10;

export default Module.extend({

  type: 'module-graph', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Graph',

  xValueInPort: belongsTo('port-value-in', { async: false }),
  yValueInPort: belongsTo('port-value-in', { async: false }),

  values: [],

  writeValue() {
    let xValue = get(this, 'xValueInPort').getValue();
    let yValue = get(this, 'yValueInPort').getValue();
    get(this, 'values').pushObject({ 'x': xValue, 'y': yValue });
  },

  reset() {
    get(this, 'values').clear();
  },

  ready() {
    if (get(this, 'isNew')) {
      set(this, 'title', this.name);
      // create ports
      this.addValueInPort('x', 'xValueInPort', {'isEnabled': true });
      this.addValueInPort('y', 'yValueInPort', {'isEnabled': true });
      this.addEventInPort('write', 'writeValue', true);
      this.addEventInPort('reset', 'reset', true);

      console.log('module-value didCreate saveLater');
      this.requestSave();
    }
  }

});
