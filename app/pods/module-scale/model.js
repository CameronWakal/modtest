import DS from 'ember-data';
import Module from '../module/model';

export default Module.extend({
  
  label: 'Scale',
  degreesInScale: 7,

  degrees: DS.belongsTo('array'),

  inputTypeSetting: DS.belongsTo('module-setting-menu', {async:false}),
  inputType: Ember.computed.alias('inputTypeSetting.value'),

  degreeInPort: DS.belongsTo('port-value-in', {async:false}),
  octaveInPort: DS.belongsTo('port-value-in', {async:false}),
  rootInPort: DS.belongsTo('port-value-in', {async:false}),
  shiftInPort: DS.belongsTo('port-value-in', {async:false}),

  getNote() {

    // 1. get input values
    // 2. set defaults if they are null
    // 3. convert to integers
    // 4. do math

    let degree = this.get('degreeInPort').getValue();
    let octave = this.get('octaveInPort').getValue();
    let root = this.get('rootInPort').getValue();
    let shift = this.get('shiftInPort').getValue();

    if(degree == null) { degree = 0; }
    if(octave == null) { octave = 3; }
    if(root == null) { root = 0; }
    if(shift == null) { shift = 0; }

    degree = parseInt(degree);
    octave = parseInt(octave);
    root = parseInt(root);

    let degreeInOctave = this.mod(degree, this.get('degreesInScale'));
    let degreeItem = this.get('degrees.items').findBy('index', degreeInOctave);
    this.set('degrees.currentItem', degreeItem);
    let intervalForDegree = degreeItem.get('value');

    if(intervalForDegree == null) {
      return null;
    } else {
      intervalForDegree = parseInt(intervalForDegree);
    }

    octave = octave + 1 + this.div(degree, this.get('degreesInScale'));

    let note = (octave*12)+root+intervalForDegree;

    //console.log('octave:'+octave+' root:'+root+' degree:'+degree+' interval:'+intervalForDegree+' note:'+note);

    return note;
  },

  didCreate() {
    //create degrees
    let degrees = this.store.createRecord('array', {module:this, length:this.get('degreesInScale')});
    degrees.set('valueMax', 11),
    this.set('degrees', degrees);

    //create settings
    //todo: set up the menu setting in the new reference style like module-setting-numberref
    this.addMenuSetting('Input Type', 'inputTypeSetting', ['Number', 'Slider', 'Both'], 'Number');

    //create ports
    this.addValueInPort('degree', 'degreeInPort');
    this.addValueInPort('octave', 'octaveInPort');
    this.addValueInPort('root', 'rootInPort');
    this.addValueInPort('shift', 'shiftInPort');
    this.addValueOutPort('note', 'getNote');

    this.save();
  },

  mod(num, mod) {
    var remain = num % mod;
    return Math.floor(remain >= 0 ? remain : remain + mod);
  },

  div(num, denom) {
    return Math[num > 0 ? 'floor' : 'ceil'](num / denom);
  }

});
