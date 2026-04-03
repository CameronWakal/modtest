import { attr, belongsTo } from '@ember-data/model';
import Module from '../module/model';

export default class ModuleGraphModel extends Module {
  type = 'module-graph'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Graph';

  lineValues = null;
  trianglesValues = null;

  @attr('number', { defaultValue: -1 }) xMin;
  @attr('number', { defaultValue: 1 }) xMax;
  @attr('number', { defaultValue: -1 }) yMin;
  @attr('number', { defaultValue: 1 }) yMax;
  @attr('number', { defaultValue: 100 }) xScale;
  @attr('number', { defaultValue: 100 }) yScale;

  @belongsTo('port-value-in', { async: false, inverse: null }) xLineValueInPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) yLineValueInPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) xTrianglesValueInPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) yTrianglesValueInPort;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    if (this.isNew && this.ports.length === 0) {
      this.title = this.name;

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
    }

    this.lineValues = [];
    this.trianglesValues = [];
  }

  writeLineValue() {
    let xLineValue = this.xLineValueInPort.getValue();
    let yLineValue = this.yLineValueInPort.getValue();
    this.lineValues.push({ x: xLineValue, y: yLineValue });
  }

  // three values in a row draw a triangle, every fourth value will be
  // the center of effect for that triangle
  writeTrianglesValue() {
    let x = this.xTrianglesValueInPort.getValue();
    let y = this.yTrianglesValueInPort.getValue();
    this.trianglesValues.push({ x, y });
  }

  reset() {
    this.lineValues.length = 0;
    this.trianglesValues.length = 0;
  }
}
