import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  
  patch: DS.belongsTo('patch'),
  ports: DS.hasMany('port'),

  eventOutputPorts: Ember.computed('ports.@each.isEvent', 'ports.@each.isSource', function(){
    let ports = this.get('ports');
    return ports.filterBy('isEvent', true).filterBy('isSource', true);
  }),

  addPort(signal, direction, label) {
    let port = this.store.createRecord('port', {
      signal:signal,
      direction:direction,
      label:label,
      module:this
    });
    port.save();
    this.get('ports').pushObject(port);
  },

  destroyPorts() {
    this.get('ports').forEach(function(port) {
      port.destroyRecord();
    });
  }

});
