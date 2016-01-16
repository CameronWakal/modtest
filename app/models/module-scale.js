import ModuleGenericComponent from './module-generic';

export default ModuleGenericComponent.extend({
  
  degrees: DS.hasMany('module-sequence-degrees'),

  degreeInPort: DS.belongsTo('port-value-in', {async:false}),
  octaveInPort: DS.belongsTo('port-value-in', {async:false}),
  rootInPort: DS.belongsTo('port-value-in', {async:false}),

  getNote() {
    let degree = this.get('degreeInPort').getValue();
    let octave = this.get('octaveInPort').getValue();
    let root = this.get('rootInPort').getValue();

    if(degree == null) degree = 0;
    if(octave == null) octave = 4;
    if(root == null) root = 0;

    return ((octave+1)*12)+root+degree;
  },

  didCreate() {

    for(var i = 0; i < 7; i++) {
      this.store.createRecord('module-scale-degree', {scale:this, index:i});
    }

    //create ports
    this.addValueOutPort('note', 'getNote');

    this.addValueInPort('degree', 'degreeInPort');
    this.addValueInPort('octave', 'octaveInPort');
    this.addValueInPort('root', 'rootInPort');
  },

});
