import DS from 'ember-data';

export default DS.Model.extend({
  xPos: DS.attr('number'),
  yPos: DS.attr('number'),
  patch: DS.belongsTo('patch'),
  //ports: DS.hasMany('port'),
  type: DS.attr('string'),
  stateVars: DS.attr()
});
