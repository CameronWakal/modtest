import DS from 'ember-data';

export default DS.Model.extend({
  
  length: DS.attr('number', { defaultValue: 16 }),
  inputs: DS.hasMany('input'),
  currentInput: DS.belongsTo('input', {async:false}),
  module: DS.belongsTo('module', {async:false, polymorphic:true}),

});
