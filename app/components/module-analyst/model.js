import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  get,
  set,
  run
} = Ember;

const {
  belongsTo
} = DS;

/* Module attempts to identify key signature of a series of notes,
 * using the 'CEG Key-Finding Method' as described in the paper
 * 'Towards a Mathematical Model of Tonality'
 * http://dspace.mit.edu/handle/1721.1/9139#files-area
 */

const maxValues = 8;

// subset of example data from p. 103
const samplePitchNames = ['C', 'F', 'F', 'G', 'A', 'F', 'A', 'Bb'];
const sampleDurations = [0.25, 0.25, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125];

// notes are indexed by number of perfect fifths (seven half-steps) starting from C
// e.g. C->G is 7 half steps, G->D is another 7 half-steps

// use the spiral order index to look up the note name:
const indexedPitchNames = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
// use the half-step from the octave to look up the spiral index:
const indexedHalfSteps = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];

// variables summarized on p. 62
// optimal values described on p. 95

const r = 1; // radius of the spiral
const h = 0.365148371670111; // height gain per quarter turn of the spiral (sqrt 2/15)

// weights on major chord pitches
const w1 = 0.6025;
const w2 = 0.2930;
const w3 = 0.1145;

// weights on minor chord pitches
const u1 = 0.6011;
const u2 = 0.2121;
const u3 = 0.1868;

// weights on major key chords
const wc1 = w1;
const wc2 = w2;
const wc3 = w3;

// weights on minor key chords
const uc1 = w1;
const uc2 = w2;
const uc3 = w3;

const a = 0.75; // preference for V vs. v chord in minor key
const b = 0.75; // preference for iv vs. IV chord in minor key

export default Module.extend({

  type: 'module-analyst', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Analyst',

  // precalculated CE coordinates for all major/minor keys
  majorKeyReps: [],
  minorKeyReps: [],

  // coordinates of each pitch in the set
  pitchReps: [],
  // calculated center of effect for the set of notes
  pitchSetRep: null,
  pitchSetDuration: 0,

  // generate the 3d coordinate representing a pitch at the given index. p.58
  pitchRepForIndex(i) {
    let x = Math.round(r * Math.sin((i * Math.PI) / 2));
    let y = Math.round(r * Math.cos((i * Math.PI) / 2));
    let z = i * h;
    return { 'x': x, 'y': y, 'z': z };
  },

  // generate 3d coordinate representing a major chord based on the index of the tonic pitch. p.58
  majorChordRepForIndex(i) {
    let p1 = this.pitchRepForIndex(i);
    let p2 = this.pitchRepForIndex(i + 1);
    let p3 = this.pitchRepForIndex(i + 4);

    let cx = p1.x * w1 + p2.x * w2 + p3.x * w3;
    let cy = p1.y * w1 + p2.y * w2 + p3.y * w3;
    let cz = p1.z * w1 + p2.z * w2 + p3.z * w3;

    return { 'x': cx, 'y': cy, 'z': cz };
  },

  // generate 3d coordinate representing CE of a minor chord based on the index of the tonic pitch. p.58
  minorChordRepForIndex(i) {
    let p1 = this.pitchRepForIndex(i);
    let p2 = this.pitchRepForIndex(i + 1);
    let p3 = this.pitchRepForIndex(i - 3);

    let cx = p1.x * u1 + p2.x * u2 + p3.x * u3;
    let cy = p1.y * u1 + p2.y * u2 + p3.y * u3;
    let cz = p1.z * u1 + p2.z * u2 + p3.z * u3;

    return { 'x': cx, 'y': cy, 'z': cz };
  },

  // generate 3d coordinate representing CE for major key based on the index of the root pitch. p.58
  majorKeyRepForIndex(i) {
    let c1 = this.majorChordRepForIndex(i);
    let c2 = this.majorChordRepForIndex(i+1);
    let c3 = this.majorChordRepForIndex(i-1);

    let kx = c1.x * wc1 + c2.x * wc2 + c3.x * wc3;
    let ky = c1.y * wc1 + c2.y * wc2 + c3.y * wc3;
    let kz = c1.z * wc1 + c2.z * wc2 + c3.z * wc3;

    return { 'x': kx, 'y': ky, 'z': kz };
  },

  // generate 3d coordinate representing CE for minor key based on the index of the root pitch. p.58
  minorKeyRepForIndex(i) {
    let c1 = this.minorChordRepForIndex(i);
    let c2maj = this.majorChordRepForIndex(i+1);
    let c2min = this.minorChordRepForIndex(i+1);
    let c3min = this.minorChordRepForIndex(i-1);
    let c3maj = this.majorChordRepForIndex(i-1);

    let c2x = c2maj.x * a + c2min.x * (1 - a);
    let c3x = c3min.x * b + c3maj.x * (1 - b);
    let kx = c1.x * uc1 + c2x * uc2 + c3x * uc3;

    let c2y = c2maj.y * a + c2min.y * (1 - a);
    let c3y = c3min.y * b + c3maj.y * (1 - b);
    let ky = c1.y * uc1 + c2y * uc2 + c3y * uc3;

    let c2z = c2maj.z * a + c2min.z * (1 - a);
    let c3z = c3min.z * b + c3maj.z * (1 - b);
    let kz = c1.z * uc1 + c2z * uc2 + c3z * uc3;

    return { 'x': kx, 'y': ky, 'z': kz };
  },

  // add a pitch representation to the set of reps being analysed
  // update the center of effect, which is the average position of all pitches
  addPitchToSet(index, duration) {
    let pitchRep = this.pitchRepForIndex(index);
    let center = this.pitchSetRep;

    if (center == null) {
      center = pitchRep;
    } else {
      let weightA = this.pitchSetDuration / (this.pitchSetDuration + duration);
      let weightB = duration / (this.pitchSetDuration + duration);

      center.x = center.x * weightA + pitchRep.x * weightB;
      center.y = center.y * weightA + pitchRep.y * weightB;
      center.z = center.z * weightA + pitchRep.z * weightB;
    }

    this.pitchReps.pushObject(pitchRep);
    this.pitchSetDuration += duration;
    this.pitchSetRep = center;
  },

  indexForPitchName(name) {
    switch(name) {
      case 'C': return 0;
      case 'C#':
      case 'Db': return 7;
      case 'D': return 2;
      case 'D#':
      case 'Eb': return 9;
      case 'E': return 4;
      case 'F': return 11;
      case 'F#':
      case 'Gb': return 6;
      case 'G': return 1;
      case 'G#':
      case 'Ab': return 8;
      case 'A': return 3;
      case 'A#':
      case 'Bb': return 10;
      case 'B': return 5;
    }
    Console.log('error: indexForPitchName did not recognize', name);
  },

  distanceBetweenReps(a, b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    let dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  nearestKeysToRep(rep) {
    let nearestKeys = [];
    let index = 0;
    let distance = this.distanceBetweenReps(rep, this.majorKeyReps[0]);
    console.log('a distance', distance);
    nearestKeys.pushObject({ 'index': index, 'scale': 'major', 'distance': distance });
    console.log('added key 0 at 0');

    // iterate all major key reps
    for(let i = 1; i < this.majorKeyReps.length; i++) {
      distance = this.distanceBetweenReps(rep, this.majorKeyReps[i]);
      console.log('a distance', distance);
      // iterate our collection of nearestKeys
      for(let j = 0; j <= 2; j++) {
        // if the distance of key i is better than the distance of key j, splice it in
        // and keep the nearestKeys list to max 3 keys.
        if (nearestKeys[j]) {
          if (nearestKeys[j].distance > distance) {
            nearestKeys.splice(j, 0, { 'index': i, 'scale': 'major', 'distance': distance });
            nearestKeys = nearestKeys.slice(0, 3);
            console.log('inserted better key', i, 'at position', j);
            break;
          }
        } else {
          // still room for more keys in the nearestKeys list, toss ours in.
          nearestKeys.splice(j, 0, { 'index': i, 'scale': 'major', 'distance': distance });
          console.log('added key', i, 'at', j);
          break;
        }
      }
    }

    // repeat for minor keys
    for(let i = 1; i < this.minorKeyReps.length; i++) {
      distance = this.distanceBetweenReps(rep, this.minorKeyReps[i]);
      console.log('a distance', distance);
      for(let j = 0; j <= 2; j++) {
        if (nearestKeys[j]) {
          if (nearestKeys[j].distance > distance) {
            nearestKeys.splice(j, 0, { 'index': i, 'scale': 'minor', 'distance': distance });
            nearestKeys = nearestKeys.slice(0, 3);
            console.log('inserted better key', i, 'at position', j);
            break;
          }
        } else {
          nearestKeys.splice(j, 0, { 'index': i, 'scale': 'minor', 'distance': distance });
          console.log('added key', i, 'at', j);
          break;
        }
      }
    }

    return nearestKeys;
  },

  valueInPort: belongsTo('port-value-in', { async: false }),
  values: [],

  // debug stuff
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

  draw() {
    let index = get(this, 'drawIndexInPort').getValue();
    let scale = get(this, 'drawScaleInPort').getValue() ? 'major' : 'minor';

    get(this, 'resetOut').sendEvent({});
    this.drawSpiralDebug();
    this.drawTrianglesDebug(index, scale);
  },

  drawSpiralDebug() {
    // plot spiral values for debugging graph
    let res = 20;

    for(let i = -2 * res; i <= 11 * res; i++) {
      let x = r * Math.sin(((i / res) * Math.PI) / 2);
      let y = r * Math.cos(((i / res) * Math.PI) / 2);
      let z = (i / res) * h;
      // send values *1000 for precision over int value ports
      this.spiralX = x*1000;
      this.spiralY = y*1000;
      this.spiralZ = z*1000;
      get(this, 'spiralDebugOut').sendEvent({});
    }
  },

  // draw visual representation of a major or minor key
  drawTrianglesDebug(i, scale) {
    if(scale == 'major') {

      this.drawMajorChordRep(i);
      this.drawMajorChordRep(i+1);
      this.drawMajorChordRep(i-1);

      let p = this.majorChordRepForIndex(i);
      this.trianglesX = p.x * 1000;
      this.trianglesY = p.y * 1000;
      this.trianglesZ = p.z * 1000;
      get(this, 'trianglesDebugOut').sendEvent({});

      p = this.majorChordRepForIndex(i+1);
      this.trianglesX = p.x * 1000;
      this.trianglesY = p.y * 1000;
      this.trianglesZ = p.z * 1000;
      get(this, 'trianglesDebugOut').sendEvent({});

      p = this.majorChordRepForIndex(i-1);
      this.trianglesX = p.x * 1000;
      this.trianglesY = p.y * 1000;
      this.trianglesZ = p.z * 1000;
      get(this, 'trianglesDebugOut').sendEvent({});

      p = this.majorKeyRepForIndex(i);
      this.trianglesX = p.x * 1000;
      this.trianglesY = p.y * 1000;
      this.trianglesZ = p.z * 1000;
      get(this, 'trianglesDebugOut').sendEvent({});

    } else if(scale == 'minor') {

      this.drawMinorChordRep(i);
      this.drawMajorChordRep(i+1);
      this.drawMinorChordRep(i+1);
      this.drawMinorChordRep(i-1);
      this.drawMajorChordRep(i-1);


      let c1 = this.minorChordRepForIndex(i);
      let c2maj = this.majorChordRepForIndex(i+1);
      let c2min = this.minorChordRepForIndex(i+1);
      let c3min = this.minorChordRepForIndex(i-1);
      let c3maj = this.majorChordRepForIndex(i-1);

      let c2x = c2maj.x * a + c2min.x * (1 - a);
      let c3x = c3min.x * b + c3maj.x * (1 - b);

      let c2y = c2maj.y * a + c2min.y * (1 - a);
      let c3y = c3min.y * b + c3maj.y * (1 - b);

      let c2z = c2maj.z * a + c2min.z * (1 - a);
      let c3z = c3min.z * b + c3maj.z * (1 - b);

      this.trianglesX = c1.x * 1000;
      this.trianglesY = c1.y * 1000;
      this.trianglesZ = c1.z * 1000;
      get(this, 'trianglesDebugOut').sendEvent({});

      this.trianglesX = c2x * 1000;
      this.trianglesY = c2y * 1000;
      this.trianglesZ = c2z * 1000;
      get(this, 'trianglesDebugOut').sendEvent({});

      this.trianglesX = c3x * 1000;
      this.trianglesY = c3y * 1000;
      this.trianglesZ = c3z * 1000;
      get(this, 'trianglesDebugOut').sendEvent({});

      let p = this.minorKeyRepForIndex(i);
      this.trianglesX = p.x * 1000;
      this.trianglesY = p.y * 1000;
      this.trianglesZ = p.z * 1000;
      get(this, 'trianglesDebugOut').sendEvent({});


    } else {
      console.log('drawTrianglesDebug unrecognized scale');
    }
  },

  drawMajorChordRep(i) {
    let p = this.pitchRepForIndex(i);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    get(this, 'trianglesDebugOut').sendEvent({});


    p = this.pitchRepForIndex(i + 1);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    get(this, 'trianglesDebugOut').sendEvent({});

    p = this.pitchRepForIndex(i + 4);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    get(this, 'trianglesDebugOut').sendEvent({});

    p = this.majorChordRepForIndex(i);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    get(this, 'trianglesDebugOut').sendEvent({});

  },

  drawMinorChordRep(i) {
    let p = this.pitchRepForIndex(i);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    get(this, 'trianglesDebugOut').sendEvent({});


    p = this.pitchRepForIndex(i + 1);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    get(this, 'trianglesDebugOut').sendEvent({});

    p = this.pitchRepForIndex(i - 3);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    get(this, 'trianglesDebugOut').sendEvent({});

    p = this.minorChordRepForIndex(i);
    this.trianglesX = p.x * 1000;
    this.trianglesY = p.y * 1000;
    this.trianglesZ = p.z * 1000;
    get(this, 'trianglesDebugOut').sendEvent({});
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
  //---

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

      // debug stuff
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
      //---

      console.log('module-value didCreate saveLater');
      this.requestSave();
    }

    for(let i = 0; i <= 11; i++) {
      this.majorKeyReps.pushObject(this.majorKeyRepForIndex(i));
    }
    for(let i = 0; i <= 11; i++) {
      this.minorKeyReps.pushObject(this.minorKeyRepForIndex(i));
    }

    /*
    // console debug tests
    this.printKeyReps();

    this.addPitchToSet(this.indexForPitchName('C'), 0.25);
    // this.addPitchToSet(this.indexForPitchName('F'), 0.25);
    let topKeys = this.nearestKeysToRep(this.pitchSetRep);
    this.printNearestKeys(topKeys);

    // verification of correct CMaj position given correct parameters
    console.log('CM', this.majorChordRepForIndex(0));
    console.log('x', r * w2, 'y', (w1+w3)*r, 'z', (w2 + 4*w3) * h);

    // verification of correct Cmin position given correct parameters
    console.log('CM', this.minorChordRepForIndex(0));
    console.log('x', (u2+u3)*r, 'y', u1*r, 'z', (u2-3*u3)*h);
    */

    run.scheduleOnce('afterRender', this, function() {
      this.drawSpiralDebug();
      this.drawTrianglesDebug(0, 'major');
    });

  },

  printKeyReps() {
    console.log('Major Keys:');
    for(let i = 0; i < this.majorKeyReps.length; i++) {
      console.log(i + ':' + indexedPitchNames[i] + 'M', this.trunc(this.majorKeyReps[i].x, 4), this.trunc(this.majorKeyReps[i].y, 4), this.trunc(this.majorKeyReps[i].z, 4));
    }
    console.log('Minor Keys:');
    for(let i = 0; i < this.minorKeyReps.length; i++) {
      console.log(i + ':' + indexedPitchNames[i] + 'm', this.trunc(this.minorKeyReps[i].x, 4), this.trunc(this.minorKeyReps[i].y, 4), this.trunc(this.minorKeyReps[i].z, 4));
    }
  },

  printNearestKeys(nearestKeys) {
    let name1 = indexedPitchNames[nearestKeys[0].index];
    let name2 = indexedPitchNames[nearestKeys[1].index];
    let name3 = indexedPitchNames[nearestKeys[2].index];
    console.log(name1+nearestKeys[0].scale, this.trunc(nearestKeys[0].distance, 4), name2+nearestKeys[1].scale, this.trunc(nearestKeys[1].distance, 4), name3+nearestKeys[2].scale, this.trunc(nearestKeys[2].distance, 4));
  },

  // https://stackoverflow.com/questions/4912788/truncate-not-round-off-decimal-numbers-in-javascript
  trunc(number, digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = number.toString().match(re);
    return m ? parseFloat(m[1]) : number.valueOf();
  }

});
