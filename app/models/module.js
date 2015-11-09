import DS from 'ember-data';

export default DS.Model.extend({
  patch: DS.belongsTo('patch'),
  sources: DS.hasMany('connection', {inverse: 'destModule'}),
  dests: DS.hasMany('connection', {inverse: 'sourceModule'}),
  type: DS.attr('string')
});
