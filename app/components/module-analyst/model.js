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

  pitchRepresentations: [],

  pitchRepresentationsForIndexes(indexes) {
    indexes.forEach(function(index) {
      this.pitchRepresentations.push(this.pitchRepresentationForIndex(index));
    }, this);
  },

  // generate the 3d coordinate representing a pitch at the given index
  pitchRepresentationForIndex(i) {
    let x = Math.round(Math.sin((i * Math.PI) / 2));
    let y = Math.round(Math.cos((i * Math.PI) / 2));
    let z = i * h;
    return { x, y, z };
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

    this.pitchRepresentationsForIndexes(pitchIndexes);
    console.log(this.pitchRepresentations);
  }

});
