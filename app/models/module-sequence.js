import DS from 'ember-data';

export default DS.Model.extend({
  
  length: DS.attr('number', { defaultValue: 16 }),
  steps: DS.hasMany('module-sequence-step'),
  currentStep: DS.attr('number'),
  module: DS.belongsTo('module', { inverse: 'sequence'})

});
