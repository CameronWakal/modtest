import DS from 'ember-data';

export default DS.Model.extend({
  patch: DS.belongsTo('patch'),
  ports: DS.hasMany('port'),
  type: DS.attr('string')
});
