import { get } from '@ember/object';
import DS from 'ember-data';
import ModuleAnalyst from '../module-analyst/model';

const {
  belongsTo
} = DS;

export default ModuleAnalyst.extend({

  type: 'module-analyst-graphable', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Analyst Graphable',

  spiralX: null,
  spiralY: null,
  spiralZ: null,
  trianglesX: null,
  trianglesY: null,
  trianglesZ: null,
  spiralDebugOut: belongsTo('port-event-out', { async: false }),
  trianglesDebugOut: belongsTo('port-event-out', { async: false }),
  drawIndexInPort: belongsTo('port-value-in', { async: false }),
  drawScaleInPort: belongsTo('port-value-in', { async: false }),
  resetOut: belongsTo('port-event-out', { async: false }),

  ready() {
    this._super();
    if (this.isNew) {
      // graphing outputs
      this.addValueOutPort('sx', 'getSpiralX', true);
      this.addValueOutPort('sy', 'getSpiralY', true);
      this.addValueOutPort('sz', 'getSpiralZ', true);
      this.addEventOutPort('s', 'spiralDebugOut', true);
      this.addValueOutPort('tx', 'getTrianglesX', true);
      this.addValueOutPort('ty', 'getTrianglesY', true);
      this.addValueOutPort('tz', 'getTrianglesZ', true);
      this.addEventOutPort('t', 'trianglesDebugOut', true);

      this.addEventInPort('draw', 'draw', true);
      this.addEventOutPort('reset', 'resetOut', true);
      this.addValueInPort('index', 'drawIndexInPort', { 'isEnabled': true });
      this.addValueInPort('scale', 'drawScaleInPort', { 'maxValue': 1, 'minValue': 0, 'isEnabled': true });

      console.log('module-value didCreate saveLater');
      this.requestSave();
    }
  },

  getSpiralX() {
    return this.spiralX;
  },
  getSpiralY() {
    return this.spiralY;
  },
  getSpiralZ() {
    return this.spiralZ;
  },
  getTrianglesX() {
    return this.trianglesX;
  },
  getTrianglesY() {
    return this.trianglesY;
  },
  getTrianglesZ() {
    return this.trianglesZ;
  },

  draw() {
    let index = this.drawIndexInPort.getValue();
    let scale = this.drawScaleInPort.getValue() ? 'major' : 'minor';

    this.resetOut.sendEvent({});
    this.drawSpiralDebug();
    this.drawTrianglesDebug(index, scale);
  },

  drawSpiralDebug() {
    // plot spiral values for debugging graph
    let res = 20;

    for (let i = -2 * res; i <= 11 * res; i++) {
      let x = this.spiralRadius * Math.sin(((i / res) * Math.PI) / 2);
      let y = this.spiralRadius * Math.cos(((i / res) * Math.PI) / 2);
      let z = (i / res) * this.spiralHeight;
      // send values *1000 for precision over int value ports
      this.spiralX = x * 1000;
      this.spiralY = y * 1000;
      this.spiralZ = z * 1000;
      this.spiralDebugOut.sendEvent({});
    }
  },

  // draw visual representation of a major or minor key
  drawTrianglesDebug(i, scale) {
    if (scale == 'major') {

      this.drawMajorChordRep(i);
      this.drawMajorChordRep(i + 1);
      this.drawMajorChordRep(i - 1);

      let p = this.majorChordRepForIndex(i);
      this.trianglesX = p.x * 1000;
      this.trianglesY = p.y * 1000;
      this.trianglesZ = p.z * 1000;
      this.trianglesDebugOut.sendEvent({});

      p = this.majorChordRepForIndex(i + 1);
      this.trianglesX = p.x * 1000;
      this.trianglesY = p.y * 1000;
      this.trianglesZ = p.z * 1000;
      this.trianglesDebugOut.sendEvent({});

      p = this.majorChordRepForIndex(i - 1);
      this.trianglesX = p.x * 1000;
      this.trianglesY = p.y * 1000;
      this.trianglesZ = p.z * 1000;
      this.trianglesDebugOut.sendEvent({});

      p = this.majorKeyRepForIndex(i);
      this.trianglesX = p.x * 1000;
      this.trianglesY = p.y * 1000;
      this.trianglesZ = p.z * 1000;
      this.trianglesDebugOut.sendEvent({});

    } else if (scale == 'minor') {

      this.drawMinorChordRep(i);
      this.drawMajorChordRep(i + 1);
      this.drawMinorChordRep(i + 1);
      this.drawMinorChordRep(i - 1);
      this.drawMajorChordRep(i - 1);

      let c1 = this.minorChordRepForIndex(i);
      let c2maj = this.majorChordRepForIndex(i + 1);
      let c2min = this.minorChordRepForIndex(i + 1);
      let c3min = this.minorChordRepForIndex(i - 1);
      let c3maj = this.majorChordRepForIndex(i - 1);

      let c2x = c2maj.x * this.weightA + c2min.x * (1 - this.weightA);
      let c3x = c3min.x * this.weightB + c3maj.x * (1 - this.weightB);

      let c2y = c2maj.y * this.weightA + c2min.y * (1 - this.weightA);
      let c3y = c3min.y * this.weightB + c3maj.y * (1 - this.weightB);

      let c2z = c2maj.z * this.weightA + c2min.z * (1 - this.weightA);
      let c3z = c3min.z * this.weightB + c3maj.z * (1 - this.weightB);

      this.trianglesX = c1.x * 1000;
      this.trianglesY = c1.y * 1000;
      this.trianglesZ = c1.z * 1000;
      this.trianglesDebugOut.sendEvent({});

      this.trianglesX = c2x * 1000;
      this.trianglesY = c2y * 1000;
      this.trianglesZ = c2z * 1000;
      this.trianglesDebugOut.sendEvent({});

      this.trianglesX = c3x * 1000;
      this.trianglesY = c3y * 1000;
      this.trianglesZ = c3z * 1000;
      this.trianglesDebugOut.sendEvent({});

      let p = this.minorKeyRepForIndex(i);
      this.trianglesX = p.x * 1000;
      this.trianglesY = p.y * 1000;
      this.trianglesZ = p.z * 1000;
      this.trianglesDebugOut.sendEvent({});

    } else {
      console.log('drawTrianglesDebug unrecognized scale');
    }
  },

  drawMajorChordRep(i) {
    let p = this.pitchRepForIndex(i);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    this.trianglesDebugOut.sendEvent({});

    p = this.pitchRepForIndex(i + 1);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    this.trianglesDebugOut.sendEvent({});

    p = this.pitchRepForIndex(i + 4);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    this.trianglesDebugOut.sendEvent({});

    p = this.majorChordRepForIndex(i);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    this.trianglesDebugOut.sendEvent({});

  },

  drawMinorChordRep(i) {
    let p = this.pitchRepForIndex(i);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    this.trianglesDebugOut.sendEvent({});

    p = this.pitchRepForIndex(i + 1);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    this.trianglesDebugOut.sendEvent({});

    p = this.pitchRepForIndex(i - 3);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    this.trianglesDebugOut.sendEvent({});

    p = this.minorChordRepForIndex(i);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    this.trianglesDebugOut.sendEvent({});
  }

});
