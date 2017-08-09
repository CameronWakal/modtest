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
const pitchNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'G', 'G#', 'A', 'A#', 'B'];
const pitchIndexes = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];

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

  type: 'module-value', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Analyst',

  // generate the 3d coordinate representing a pitch at the given index. p.58
  pitchRepForIndex(i) {
    let x = Math.round(Math.sin((i * Math.PI) / 2));
    let y = Math.round(Math.cos((i * Math.PI) / 2));
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

    console.log('pitch 0', this.pitchRepForIndex(0));
    console.log('pitch 1', this.pitchRepForIndex(1));
    console.log('pitch 4', this.pitchRepForIndex(4));
    console.log('major chord 0', this.majorChordRepForIndex(0));
    console.log('---');
    console.log('pitch 0', this.pitchRepForIndex(0));
    console.log('pitch 1', this.pitchRepForIndex(1));
    console.log('pitch -3', this.pitchRepForIndex(-3));
    console.log('minor chord 0', this.minorChordRepForIndex(0));
    console.log('---');
    console.log('major chord 0', this.majorChordRepForIndex(0));
    console.log('major chord 1', this.majorChordRepForIndex(1));
    console.log('major chord -1', this.majorChordRepForIndex(-1));
    console.log('major key 0', this.majorKeyRepForIndex(0));
    console.log('---');
    console.log('minor chord 0', this.minorChordRepForIndex(0));
    console.log('major chord 1', this.majorChordRepForIndex(1));
    console.log('minor chord 1', this.minorChordRepForIndex(1));
    console.log('minor chord -1', this.minorChordRepForIndex(-1));
    console.log('major chord -1', this.majorChordRepForIndex(-1));
    console.log('minor key 0', this.minorKeyRepForIndex(0));
  }

});
