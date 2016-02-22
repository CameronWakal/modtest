import DS from 'ember-data';

export default DS.Model.extend({
  
  length: DS.attr('number'),
  inputs: DS.hasMany('input'),
  currentInput: DS.belongsTo('input', {async:false}),
  module: DS.belongsTo('module', {async:false, polymorphic:true}),

  initInputs() {
    //init inputs
    var input;
    for(var i = 0; i < this.get('length'); i++) {
      input = this.store.createRecord('input', {array:this, index:i});
    }
  }

});
