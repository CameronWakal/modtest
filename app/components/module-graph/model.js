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

  xMin: attr('number', { defaultValue: -1 }),
  xMax: attr('number', { defaultValue: 1 }),
  yMin: attr('number', { defaultValue: -1 }),
  yMax: attr('number', { defaultValue: 1 }),
  xScale: attr('number', { defaultValue: 100 }),
  yScale: attr('number', { defaultValue: 100 }),

  xLineValueInPort: belongsTo('port-value-in', { async: false }),
  yLineValueInPort: belongsTo('port-value-in', { async: false }),

  lineValues: null,

  writeLineValue() {
    let xLineValue = get(this, 'xLineValueInPort').getValue();
    let yLineValue = get(this, 'yLineValueInPort').getValue();
    get(this, 'lineValues').pushObject({ 'x': xLineValue, 'y': yLineValue });
  },

  reset() {
    get(this, 'values').clear();
  },

  ready() {
    if (get(this, 'isNew')) {
      set(this, 'title', this.name);

      this.addNumberSetting('xMin', 'xMin', this);
      this.addNumberSetting('yMin', 'yMin', this);
      this.addNumberSetting('xMax', 'xMax', this);
      this.addNumberSetting('yMax', 'yMax', this);
      this.addNumberSetting('xScale', 'xScale', this);
      this.addNumberSetting('yScale', 'yScale', this);
      // create ports
      this.addValueInPort('lx', 'xLineValueInPort', {'isEnabled': true });
      this.addValueInPort('ly', 'yLineValueInPort', {'isEnabled': true });
      this.addEventInPort('l', 'writeLineValue', true);
      this.addEventInPort('reset', 'reset', true);

      console.log('module-value didCreate saveLater');
      this.requestSave();
    }

    set(this, 'lineValues', []);
  }

});
