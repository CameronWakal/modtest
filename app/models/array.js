import DS from 'ember-data';

export default DS.Model.extend({
  
  length: DS.attr('number'),
  inputs: DS.hasMany('arrayItem'),
  currentInput: DS.belongsTo('arrayItem', {async:false}),
  module: DS.belongsTo('module', {async:false, polymorphic:true}),

  initInputs() {
    //init inputs
    var input;
    for(var i = 0; i < this.get('length'); i++) {
      input = this.store.createRecord('arrayItem', {array:this, index:i});
    }
  }

});
