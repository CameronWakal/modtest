import { set, get } from '@ember/object';
import DS from 'ember-data';
import Module from '../module/model';

const {
  belongsTo
} = DS;

export default Module.extend({

  type: 'module-scale', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Scale',

  degreesInScale: 7,
  degrees: belongsTo('array', { async: false }),
  inputType: 'Number',
  mode: null,

  degreeInPort: belongsTo('port-value-in', { async: false }),
  octaveInPort: belongsTo('port-value-in', { async: false }),
  rootInPort: belongsTo('port-value-in', { async: false }),
  modeInPort: belongsTo('port-value-in', { async: false }),

  updateScale() {
    let mode = get(this, 'modeInPort').getValue() % 7;
    if (this.mode == mode) {
      return;
    }
    this.mode = mode;
    console.log('updating scale mode to', mode);

    let newValues;

    switch (mode) {
      case 0:
        newValues = [0, 2, 4, 5, 7, 9, 11];
      break;
      case 1:
        newValues = [0, 2, 3, 5, 7, 9, 10];
      break;
      case 2:
        newValues = [0, 1, 3, 5, 7, 8, 10];
      break;
      case 3:
        newValues = [0, 2, 4, 6, 7, 9, 11];
      break;
      case 4:
        newValues = [0, 2, 4, 5, 7, 9, 10];
      break;
      case 5:
        newValues = [0, 2, 3, 5, 7, 8, 10];
      break;
      case 6:
        newValues = [0, 1, 3, 5, 6, 8, 10];
      break;
      default:
        console.log('module-scale error – unknown mode requested:', mode);
        return;
    }

    let items = get(this, 'degrees.items');
    items.forEach((item) => {
      set(item, 'value', newValues[get(item, 'index')]);
    });

  },

  getNote() {

    // 1. get input values
    // 2. set defaults if they are null
    // 3. convert to integers
    // 4. do math

    let degree = get(this, 'degreeInPort').getValue();
    let octave = get(this, 'octaveInPort').getValue();
    let root = get(this, 'rootInPort').getValue();

    let degreeInOctave = this.mod(degree, get(this, 'degreesInScale'));
    let degreeItem = get(this, 'degrees.items').findBy('index', degreeInOctave);
    set(this, 'degrees.currentItem', degreeItem);
    let intervalForDegree = get(degreeItem, 'value');

    if (intervalForDegree == null) {
      return null;
    }

    octave = octave + 1 + this.div(degree, get(this, 'degreesInScale'));
    let note = (octave * 12) + root + intervalForDegree;
    // console.log('octave:'+octave+' root:'+root+' degree:'+degree+' interval:'+intervalForDegree+' note:'+note);
    return note;
  },

  ready() {
    if (get(this, 'isNew')) {
      set(this, 'title', this.name);

      // create degrees
      let degrees = this.store.createRecord('array', { module: this });
      set(this, 'degrees', degrees);
      set(this, 'degrees.valueMax', 11);
      set(this, 'degrees.length', get(this, 'degreesInScale'));

      // create ports
      this.addValueInPort('degree', 'degreeInPort', { defaultValue: 0 });
      this.addValueInPort('octave', 'octaveInPort', { isEnabled: false, defaultValue: 3, minValue: -2, maxValue: 8 });
      this.addValueInPort('root', 'rootInPort', { isEnabled: false, defaultValue: 0 });
      this.addValueInPort('mode', 'modeInPort', { isEnabled: false, defaultValue: 0 });
      this.addEventInPort('update', 'updateScale', true);
      this.addValueOutPort('note', 'getNote', true);

      this.updateScale();

      console.log('module-scale.didCreate() requestSave()');
      this.requestSave();
    }
  },

  remove() {
    get(this, 'degrees').remove();
    this._super();
  },

  save() {
    get(this, 'degrees').save();
    this._super();
  },

  mod(num, mod) {
    let remain = num % mod;
    return Math.floor(remain >= 0 ? remain : remain + mod);
  },

  div(num, denom) {
    return Math[num > 0 ? 'floor' : 'ceil'](num / denom);
  }

});
