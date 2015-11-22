import DS from 'ember-data';

export default DS.Model.extend({
  
  value: DS.attr('number'),
  sequence: DS.belongsTo('module-sequence'),
  isSelected: DS.attr('boolean', {defaultValue: false})

});
