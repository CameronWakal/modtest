import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  patch: DS.belongsTo('patch'),
  ports: DS.hasMany('port'),

  eventOutputPorts: Ember.computed('ports.@each.isEvent', 'ports.@each.isSource', function(){
    let ports = this.get('ports');
    return ports.filterBy('isEvent', true).filterBy('isSource', true);
  }),

});
