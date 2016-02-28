import DS from 'ember-data';

export default DS.Model.extend({
  
  key: DS.attr('string'),
  label: DS.attr('string'),
  value: DS.attr('number'),

});
