import DS from 'ember-data';

export default DS.Model.extend({
  
  length: DS.attr('number'),
  inputs: DS.hasMany('arrayValue'),
  currentInput: DS.belongsTo('arrayValue', {async:false}),
  module: DS.belongsTo('module', {async:false, polymorphic:true}),

  initInputs() {
    //init inputs
    var input;
    for(var i = 0; i < this.get('length'); i++) {
      input = this.store.createRecord('arrayValue', {array:this, index:i});
    }
  }

});
