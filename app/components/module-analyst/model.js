import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  get,
  set,
  computed
} = Ember;

const {
  belongsTo
} = DS;

/* Module attempts to identify key signature of a series of notes,
 * using the 'CEG Key-Finding Method' as described in the paper
 * 'Towards a Mathematical Model of Tonality'
 * http://dspace.mit.edu/handle/1721.1/9139#files-area
 */

const nearestKeysCount = 3;

// notes are indexed by number of perfect fifths (seven half-steps) starting from C
// e.g. C->G is 7 half steps, G->D is another 7 half-steps

// use the spiral order index to look up the note name:
const indexedPitchNames = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
// look up a spiral index from C at the number of half-steps above C
const semitoneIndexes = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];

// variables summarized on p. 62
// optimal values described on p. 95

const r = 1; // radius of the spiral
const h = 0.3651; // height gain per quarter turn of the spiral (sqrt 2/15)

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

// pre-calculated reps from this.majorKeyRepForIndex, this.minorKeyRepForIndex
const majorKeyReps = [
  { x: 0.304517, y: 0.379692, z: 0.3427540545 },
  { x: 0.379692, y: -0.304517, z: 0.7151925645 },
  { x: -0.304517, y: -0.379692, z: 1.0876310745 },
  { x: -0.379692, y: 0.304517, z: 1.4600695845 },
  { x: 0.304517, y: 0.379692, z: 1.8325080945 },
  { x: 0.379692, y: -0.304517, z: 2.2049466045 },
  { x: -0.304517, y: -0.379692, z: 2.5773851145 },
  { x: -0.379692, y: 0.304517, z: 2.9498236245 },
  { x: 0.304517, y: 0.379692, z: 3.3222621345 },
  { x: 0.379692, y: -0.304517, z: 3.6947006445 },
  { x: -0.304517, y: -0.379692, z: 4.06713915445 },
  { x: -0.379692, y: 0.304517, z: 4.4395776645 }
];

const minorKeyReps = [
  { x: 0.3697849875, y: 0.3111992375, z: 0.03711858062625 },
  { x: 0.3111992375, y: -0.3697849875, z: 0.40677639775125 },
  { x: -0.3697849875, y: -0.3111992375, z: 0.7764342148762498 },
  { x: -0.3111992375, y: 0.3697849875, z: 1.14609203200125 },
  { x: 0.3697849875, y: 0.3111992375, z: 1.51574984912625 },
  { x: 0.3111992375, y: -0.3697849875, z: 1.88540766625125 },
  { x: -0.3697849875, y: -0.3111992375, z: 2.2550654833762502 },
  { x: -0.3111992375, y: 0.3697849875, z: 2.6247233005012505 },
  { x: 0.3697849875, y: 0.3111992375, z: 2.99438111762625 },
  { x: 0.3111992375, y: -0.3697849875, z: 3.3640389347512496 },
  { x: -0.3697849875, y: -0.3111992375, z: 3.73369675187625 },
  { x: -0.3111992375, y: 0.3697849875, z: 4.10335456900125 }
];

export default Module.extend({

  type: 'module-analyst', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Guess Key',

  // precalculated CE coordinates for all major/minor keys
  majorKeyReps,
  minorKeyReps,

  // calculated center of effect for the set of notes
  pitchSetRep: null,
  // accumulated total of pitch durations added to the set
  pitchSetDuration: 0,
  nearestKeys: null,
  nearestKeysCount,

  nearestKeyNames: computed('nearestKeys', function() {
    let nearestKeys = get(this, 'nearestKeys');
    let keyNames = [];
    for (let i = 0; i < this.nearestKeysCount; i++) {
      if (nearestKeys) {
        keyNames[i] = `${indexedPitchNames[nearestKeys[i].index]}${nearestKeys[i].scale}`;
      } else {
        keyNames[i] = '--';
      }
    }
    return keyNames;
  }),

  valueInPort: belongsTo('port-value-in', { async: false }),

  // so the graphable child module can inherit it
  spiralRadius: r,
  spiralHeight: h,
  weightA: a,
  weightB: b,

  addValue() {
    let newValue = get(this, 'valueInPort').getValue();
    if (newValue != null) {
      newValue = newValue % 12;
      newValue = semitoneIndexes[newValue];
      this.addPitchToSet(newValue, 1);

      let nearestKeys = this.nearestKeysToRep(this.pitchSetRep, this.nearestKeysCount);
      set(this, 'nearestKeys', nearestKeys);
    }
  },

  reset() {
    this.pitchSetRep = null;
    this.pitchSetDuration = 0;
    set(this, 'nearestKeys', null);
  },

  ready() {
    if (get(this, 'isNew')) {
      set(this, 'title', this.name);
      // create ports
      this.addEventInPort('in', 'addValue', true);
      this.addValueInPort('value', 'valueInPort', { isEnabled: true });
      this.addEventInPort('reset', 'reset', true);

      console.log('module-value didCreate saveLater');
      this.requestSave();
    }
  },

  // use the algorithm to overwrite the precalculated key representations
  // in case you want to experiment with different constants, etc.
  generateKeyReps() {
    for (let i = 0; i <= 11; i++) {
      this.majorKeyReps.pushObject(this.majorKeyRepForIndex(i));
    }
    for (let i = 0; i <= 11; i++) {
      this.minorKeyReps.pushObject(this.minorKeyRepForIndex(i));
    }
  },

  // generate the 3d coordinate representing a pitch at the given index. p.58
  pitchRepForIndex(i) {
    let x = Math.round(r * Math.sin((i * Math.PI) / 2));
    let y = Math.round(r * Math.cos((i * Math.PI) / 2));
    let z = i * h;
    return { x, y, z };
  },

  // generate 3d coordinate representing a major chord based on the index of the tonic pitch. p.58
  majorChordRepForIndex(i) {
    let p1 = this.pitchRepForIndex(i);
    let p2 = this.pitchRepForIndex(i + 1);
    let p3 = this.pitchRepForIndex(i + 4);

    let cx = p1.x * w1 + p2.x * w2 + p3.x * w3;
    let cy = p1.y * w1 + p2.y * w2 + p3.y * w3;
    let cz = p1.z * w1 + p2.z * w2 + p3.z * w3;

    return { x: cx, y: cy, z: cz };
  },

  // generate 3d coordinate representing CE of a minor chord based on the index of the tonic pitch. p.58
  minorChordRepForIndex(i) {
    let p1 = this.pitchRepForIndex(i);
    let p2 = this.pitchRepForIndex(i + 1);
    let p3 = this.pitchRepForIndex(i - 3);

    let cx = p1.x * u1 + p2.x * u2 + p3.x * u3;
    let cy = p1.y * u1 + p2.y * u2 + p3.y * u3;
    let cz = p1.z * u1 + p2.z * u2 + p3.z * u3;

    return { x: cx, y: cy, z: cz };
  },

  // generate 3d coordinate representing CE for major key based on the index of the root pitch. p.58
  majorKeyRepForIndex(i) {
    let c1 = this.majorChordRepForIndex(i);
    let c2 = this.majorChordRepForIndex(i + 1);
    let c3 = this.majorChordRepForIndex(i - 1);

    let kx = c1.x * wc1 + c2.x * wc2 + c3.x * wc3;
    let ky = c1.y * wc1 + c2.y * wc2 + c3.y * wc3;
    let kz = c1.z * wc1 + c2.z * wc2 + c3.z * wc3;

    return { x: kx, y: ky, z: kz };
  },

  // generate 3d coordinate representing CE for minor key based on the index of the root pitch. p.58
  minorKeyRepForIndex(i) {
    let c1 = this.minorChordRepForIndex(i);
    let c2maj = this.majorChordRepForIndex(i + 1);
    let c2min = this.minorChordRepForIndex(i + 1);
    let c3min = this.minorChordRepForIndex(i - 1);
    let c3maj = this.majorChordRepForIndex(i - 1);

    let c2x = c2maj.x * a + c2min.x * (1 - a);
    let c3x = c3min.x * b + c3maj.x * (1 - b);
    let kx = c1.x * uc1 + c2x * uc2 + c3x * uc3;

    let c2y = c2maj.y * a + c2min.y * (1 - a);
    let c3y = c3min.y * b + c3maj.y * (1 - b);
    let ky = c1.y * uc1 + c2y * uc2 + c3y * uc3;

    let c2z = c2maj.z * a + c2min.z * (1 - a);
    let c3z = c3min.z * b + c3maj.z * (1 - b);
    let kz = c1.z * uc1 + c2z * uc2 + c3z * uc3;

    return { x: kx, y: ky, z: kz };
  },

  // add a pitch representation to the set of reps being analysed
  // update the center of effect, which is the average position of all pitches
  addPitchToSet(index, duration) {
    let pitchRep = this.pitchRepForIndex(index);
    let center = this.pitchSetRep;
    let spiralHeight = h * 12;

    if (center == null) {
      center = { 'x': pitchRep.x, 'y': pitchRep.y, 'z': pitchRep.z };
    } else {
      let weightA = this.pitchSetDuration / (this.pitchSetDuration + duration);
      let weightB = duration / (this.pitchSetDuration + duration);

      // find an alternate z value on the opposite side of the center,
      // one spiral-length away from the original z value
      let otherZ;
      if (pitchRep.z > center.z) {
        otherZ = pitchRep.z - spiralHeight;
      } else {
        otherZ = pitchRep.z + spiralHeight;
      }
      // use whichever of the two z values is closer to the current center
      if (Math.abs(otherZ - center.z) < Math.abs(pitchRep.z - center.z)) {
        pitchRep.z = otherZ;
      }

      center.x = center.x * weightA + pitchRep.x * weightB;
      center.y = center.y * weightA + pitchRep.y * weightB;
      center.z = center.z * weightA + pitchRep.z * weightB;
    }

    this.pitchSetDuration += duration;
    this.pitchSetRep = center;
  },

  indexForPitchName(name) {
    switch (name) {
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
    console.log('error: indexForPitchName did not recognize', name);
  },

  // distance between reps considering the repeating spiral: each pair of
  // points has a distance in two directions, take the smallest.
  minimumDistanceBetweenReps(a, b) {
    let spiralHeight = h * 12;
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    let dz = a.z - b.z;
    let distance1 = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (a.z > b.z) {
      dz = (a.z - spiralHeight) - b.z;
    } else {
      dz = (a.z + spiralHeight) - b.z;
    }
    let distance2 = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return Math.min(distance1, distance2);
  },

  // check distance between a rep and all major and minor key reps,
  // return a ranked array of `keyCount` nearest keys.
  nearestKeysToRep(rep, keyCount) {
    let nearestKeys = [];
    let index = 0;
    let distance = this.minimumDistanceBetweenReps(rep, this.majorKeyReps[0]);
    nearestKeys.pushObject({ index, scale: 'M', distance });

    // iterate all major key reps
    for (let i = 1; i < this.majorKeyReps.length; i++) {
      distance = this.minimumDistanceBetweenReps(rep, this.majorKeyReps[i]);
      // iterate our collection of nearestKeys
      for (let j = 0; j <= keyCount - 1; j++) {
        // if the distance of key i is better than the distance of key j, splice it in
        // and keep the nearestKeys list to max 3 keys.
        if (nearestKeys[j]) {
          if (nearestKeys[j].distance > distance) {
            nearestKeys.splice(j, 0, { index: i, scale: 'M', distance });
            nearestKeys = nearestKeys.slice(0, keyCount);
            break;
          }
        } else {
          // still room for more keys in the nearestKeys list, toss ours in.
          nearestKeys.splice(j, 0, { index: i, scale: 'M', distance });
          break;
        }
      }
    }
    // repeat for minor keys
    for (let i = 1; i < this.minorKeyReps.length; i++) {
      distance = this.minimumDistanceBetweenReps(rep, this.minorKeyReps[i]);
      for (let j = 0; j <= keyCount - 1; j++) {
        if (nearestKeys[j]) {
          if (nearestKeys[j].distance > distance) {
            nearestKeys.splice(j, 0, { index: i, scale: 'm', distance });
            nearestKeys = nearestKeys.slice(0, keyCount);
            break;
          }
        } else {
          nearestKeys.splice(j, 0, { index: i, scale: 'm', distance });
          break;
        }
      }
    }
    return nearestKeys;
  },

  // console log functions for debugging/experimenting

  printTestSequence() {
    let testPitches = ['C', 'F', 'F', 'G', 'A', 'F', 'A', 'Bb'];
    let testDurations = [0.25, 0.25, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125];
    let nearestKeys;

    for (let i = 0; i < testPitches.length; i++) {
      this.addPitchToSet(this.indexForPitchName(testPitches[i]), testDurations[i]);
      this.printRepForIndex(this.indexForPitchName(testPitches[i]));
      console.log('center', this.pitchSetRep.x, this.pitchSetRep.y, this.pitchSetRep.z);
      nearestKeys = this.nearestKeysToRep(this.pitchSetRep, 3);
      this.printNearestKeys(nearestKeys);
    }
  },

  printKeyReps() {
    console.log('Major Keys:');
    for (let i = 0; i < this.majorKeyReps.length; i++) {
      console.log(`${i}: ${indexedPitchNames[i]}M`, this.majorKeyReps[i].x, this.majorKeyReps[i].y, this.majorKeyReps[i].z);
    }
    console.log('Minor Keys:');
    for (let i = 0; i < this.minorKeyReps.length; i++) {
      console.log(`${i}: ${indexedPitchNames[i]}m`, this.minorKeyReps[i].x, this.minorKeyReps[i].y, this.minorKeyReps[i].z);
    }
  },

  printRepForIndex(i) {
    let name = indexedPitchNames[i];
    let rep = this.pitchRepForIndex(i);
    console.log(i, name, rep.x, rep.y, rep.z);
  },

  printNearestKeys(nearestKeys) {
    let name1 = indexedPitchNames[nearestKeys[0].index];
    let name2 = indexedPitchNames[nearestKeys[1].index];
    let name3 = indexedPitchNames[nearestKeys[2].index];
    console.log(name1 + nearestKeys[0].scale, nearestKeys[0].distance, name2 + nearestKeys[1].scale, nearestKeys[1].distance, name3 + nearestKeys[2].scale, nearestKeys[2].distance);
  }

});
