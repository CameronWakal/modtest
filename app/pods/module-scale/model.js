import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

export default Module.extend({
  
  label: 'Scale',
  degreesInScale: 7,
  defaultOctave: 3,

  degrees: DS.belongsTo('array'),

  degreeInPort: DS.belongsTo('port-value-in', {async:false}),
  octaveInPort: DS.belongsTo('port-value-in', {async:false}),
  rootInPort: DS.belongsTo('port-value-in', {async:false}),

  //default value of 0 if input is null
  degree: Ember.computed('degreeInPort.value', function(){
    return this.get('degreeInPort.value')==null ? 0 : this.get('degreeInPort.value');
  }),
  //default base octave of 3 if input is null, plus more if the degree overflows the current octave
  octave: Ember.computed('octaveInPort.value','defaultOctave','degreesInScale','degree', function(){
    let baseOctave = this.get('octaveInPort.value')==null ? this.get('defaultOctave') : this.get('octaveInPort.value');
    return baseOctave + this.div( this.get('degree'), this.get('degreesInScale') );
  }),
  //default value of 0 if input is null
  root: Ember.computed('rootInPort.value', function(){
    return this.get('rootInPort.value')==null ? 0 : this.get('rootInPort.value');
  }),

  degreeInOctave: Ember.computed('degree', 'degreesInScale', function(){
    return this.mod(this.get('degree'), this.get('degreesInScale'));
  }),

  note: Ember.computed(
    'octave',
    'root',
    'degreeInOctave',
    'degrees.items.@each.intValue',
    function() {

    let degreeItem = this.get('degrees.items').findBy('index', this.get('degreeInOctave'));
    this.set('degrees.currentItem', degreeItem);

    let intervalForDegree = degreeItem.get('intValue');
    if(intervalForDegree == null) { return null; };

    let note = (this.get('octave')*12)+this.get('root')+intervalForDegree;

    //console.log('octave:'+octave+' root:'+root+' degree:'+degree+' interval:'+intervalForDegree+' note:'+note);

    return note;
  }),

  didCreate() {
    //create degrees
    let degrees = this.store.createRecord('array', {module:this, length:this.get('degreesInScale')});
    this.set('degrees', degrees);

    //create ports
    this.addValueOutPort('note', 'note');
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
