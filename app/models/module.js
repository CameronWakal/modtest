import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  patch: DS.belongsTo('patch'),
  ports: DS.hasMany('port', {async:true}),
  type: DS.attr('string'),
  componentType: DS.attr('string'),

  //state data for specific module types.
  //only one will be defined, corresponding to the module type.
  sequence: DS.belongsTo('moduleSequence'),
  out: DS.belongsTo('moduleOut'),
  clock: DS.belongsTo('moduleClock'),

  eventOutputPorts: Ember.computed('ports.@each.isEvent', 'ports.@each.isSource', function(){
    let ports = this.get('ports');
    return ports.filterBy('isEvent', true).filterBy('isSource', true);
  })

});
