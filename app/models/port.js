import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.attr('string'), //trigIn, trigOut, sigIn, sigOut
  //connectedTo: DS.belongsTo('port')
});
