import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  observer,
  get,
  set
} = Ember;

const {
  belongsTo,
  attr
} = DS;

export default Module.extend({

  type: 'module-scale', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Scale',
  degreesInScale: 7,

  degrees: belongsTo('array', { async: false }),
  inputType: 'Number',
  mode: attr('string', { defaultValue: 'I' }),

  degreeInPort: belongsTo('port-value-in', { async: false }),
  octaveInPort: belongsTo('port-value-in', { async: false }),
  rootInPort: belongsTo('port-value-in', { async: false }),

  onModeChanged: observer('mode', function() {
    let items = get(this, 'degrees.items');

    if (items) {
      let mode = get(this, 'mode');
      let newValues;

      switch (mode) {
        case 'I':
          newValues = [0, 2, 4, 5, 7, 9, 11];
        break;
        case 'II':
          newValues = [0, 2, 3, 5, 7, 9, 10];
        break;
        case 'III':
          newValues = [0, 1, 3, 5, 7, 8, 10];
        break;
        case 'IV':
          newValues = [0, 2, 4, 6, 7, 9, 11];
        break;
        case 'V':
          newValues = [0, 2, 4, 5, 7, 9, 10];
        break;
        case 'VI':
          newValues = [0, 2, 3, 5, 7, 8, 10];
        break;
        case 'VII':
          newValues = [0, 1, 3, 5, 6, 8, 10];
        break;
        default:
          console.log('module-scale error – unknown mode requested:', mode);
          return;
      }

      items.forEach((item) => {
        set(item, 'value', newValues[get(item, 'index')]);
      });
    }

  }),

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

      // create degrees
      let degrees = this.store.createRecord('array', { module: this, length: get(this, 'degreesInScale') });
      set(degrees, 'valueMax', 11);
      set(this, 'degrees', degrees);

      // create ports
      this.addValueInPort('degree', 'degreeInPort', { defaultValue: 0 });
      this.addValueInPort('octave', 'octaveInPort', { isEnabled: false, defaultValue: 3, minValue: -2, maxValue: 8 });
      this.addValueInPort('root', 'rootInPort', { isEnabled: false, defaultValue: 0 });

      this.addValueOutPort('note', 'getNote', true);

      // create settings
      this.addMenuSetting('Mode', 'mode', this, ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']);

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
