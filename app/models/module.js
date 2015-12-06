import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  
  patch: DS.belongsTo('patch'),
  ports: DS.hasMany('port'),

  eventOutputPorts: Ember.computed('ports.@each.isEvent', 'ports.@each.isSource', function(){
    let ports = this.get('ports');
    return ports.filterBy('isEvent', true).filterBy('isSource', true);
  }),

  addPort(signal, direction, label, targetMethod) {
    let port = this.store.createRecord('port', {
      signal:signal,
      direction:direction,
      label:label,
      targetMethod:targetMethod,
      module:this
    });
    port.save();
    this.get('ports').pushObject(port);
  },

  deleteRecord() {
    this.get('ports').forEach(function(port) {
      port.destroyRecord();
    });
    this._internalModel.deleteRecord();
  },

  //this should be scrapped and replaced with a direct ember data alias
  readPort(port) {
    let sourceModule = port.get('source.module');
    let varName = port.get('source.label');
    var value;
      
    if(sourceModule) {
      value = sourceModule.get(varName);
    }

    return value;
  },

});
