import DS from 'ember-data';

export default DS.Model.extend({
  signalType: DS.attr('string'), //trigger or signal
  sourceModule: DS.belongsTo('module'),
  sourcePortName: DS.attr('string'),
  destModule: DS.belongsTo('module'),
  destPortName: DS.attr('string')
});
