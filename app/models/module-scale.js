import DS from 'ember-data';
import Module from './module';

export default Module.extend({
  
  inputArray: DS.belongsTo('inputArray'),
  degreesInScale: 7,

  degreeInPort: DS.belongsTo('port-value-in', {async:false}),
  octaveInPort: DS.belongsTo('port-value-in', {async:false}),
  rootInPort: DS.belongsTo('port-value-in', {async:false}),

  getNote() {

    // 1. get input values
    // 2. set defaults if they are null
    // 3. convert to integers
    // 4. do math

    let degree = this.get('degreeInPort').getValue();
    let octave = this.get('octaveInPort').getValue();
    let root = this.get('rootInPort').getValue();

    if(degree == null) { degree = 0; }
    if(octave == null) { octave = 3; }
    if(root == null) { root = 0; }

    degree = parseInt(degree);
    octave = parseInt(octave);
    root = parseInt(root);

    let degreeInOctave = this.mod(degree, this.get('degreesInScale'));
    let degreeModel = this.get('inputArray.inputs').findBy('index', degreeInOctave);
    this.set('inputArray.currentInput', degreeModel);
    let intervalForDegree = degreeModel.get('value');

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

    //create inputArray
    this.set('inputArray', this.store.createRecord('inputArray', {module:this}));

    //create inputs
    for(var i = 0; i < this.get('degreesInScale'); i++) {
      this.store.createRecord('input', {array:this.get('inputArray'), index:i});
    }

    //create ports
    this.addValueOutPort('note', 'getNote');

    this.addValueInPort('degree', 'degreeInPort');
    this.addValueInPort('octave', 'octaveInPort');
    this.addValueInPort('root', 'rootInPort');
  },

  mod(num, mod) {
    var remain = num % mod;
    return Math.floor(remain >= 0 ? remain : remain + mod);
  },

  div(num, denom) {
    return Math[num > 0 ? 'floor' : 'ceil'](num / denom);
  }

});
