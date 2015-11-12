import DS from 'ember-data';

export default DS.Model.extend({
  signal: DS.attr('string'),                              //event or value
  direction: DS.attr('string'),                           //source or destination
  label: DS.attr('string'),                               //briefly describing port use
  destinations: DS.hasMany('port', {inverse:'source'}),   //only source ports have destinations
  source: DS.belongsTo('port'),                           //only destination ports have a source
  module: DS.belongsTo('module')
});
