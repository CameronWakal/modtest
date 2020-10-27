import { set, get } from '@ember/object';
import DS from 'ember-data';
import Module from '../module/model';

const {
  attr,
  belongsTo
} = DS;

export default Module.extend({

  type: 'module-graph', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Graph',

  lineValues: null,
  trianglesValues: null,

  xMin: attr('number', { defaultValue: -1 }),
  xMax: attr('number', { defaultValue: 1 }),
  yMin: attr('number', { defaultValue: -1 }),
  yMax: attr('number', { defaultValue: 1 }),
  xScale: attr('number', { defaultValue: 100 }),
  yScale: attr('number', { defaultValue: 100 }),

  xLineValueInPort: belongsTo('port-value-in', { async: false }),
  yLineValueInPort: belongsTo('port-value-in', { async: false }),
  xTrianglesValueInPort: belongsTo('port-value-in', { async: false }),
  yTrianglesValueInPort: belongsTo('port-value-in', { async: false }),

  writeLineValue() {
    let xLineValue = this.xLineValueInPort.getValue();
    let yLineValue = this.yLineValueInPort.getValue();
    this.lineValues.pushObject({ x: xLineValue, y: yLineValue });
  },

  // three values in a row draw a triangle, every fourth value will be
  // the center of effect for that triangle
  writeTrianglesValue() {
    let x = this.xTrianglesValueInPort.getValue();
    let y = this.yTrianglesValueInPort.getValue();
    this.trianglesValues.pushObject({ x, y });
  },

  reset() {
    this.lineValues.clear();
    this.trianglesValues.clear();
  },

  init() {
    this._super(...arguments);
    if (this.isNew) {
      set(this, 'title', this.name);

      this.addNumberSetting('xMin', 'xMin', this);
      this.addNumberSetting('yMin', 'yMin', this);
      this.addNumberSetting('xMax', 'xMax', this);
      this.addNumberSetting('yMax', 'yMax', this);
      this.addNumberSetting('xScale', 'xScale', this);
      this.addNumberSetting('yScale', 'yScale', this);
      // create ports
      this.addValueInPort('lx', 'xLineValueInPort', { isEnabled: true });
      this.addValueInPort('ly', 'yLineValueInPort', { isEnabled: true });
      this.addEventInPort('l', 'writeLineValue', true);

      this.addValueInPort('tx', 'xTrianglesValueInPort', { isEnabled: true });
      this.addValueInPort('ty', 'yTrianglesValueInPort', { isEnabled: true });
      this.addEventInPort('t', 'writeTrianglesValue', true);

      this.addEventInPort('reset', 'reset', true);

      console.log('module-value didCreate saveLater');
      this.requestSave();
    }

    set(this, 'lineValues', []);
    set(this, 'trianglesValues', []);
  }

});
