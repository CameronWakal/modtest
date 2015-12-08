import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  
  patch: DS.belongsTo('patch'),
  ports: DS.hasMany('port', {polymorphic:true}),

  eventOutputPorts: Ember.computed('ports.@each.isEvent', 'ports.@each.isSource', function(){
    let ports = this.get('ports');
    return ports.filterBy('isEvent', true).filterBy('isSource', true);
  }),

  //todo: clean up conditionals by subclassing ports into different types
  addPort(signal, direction, label, target) {
    var port;
    if(signal === 'event' && direction === 'source') {
      port = this.store.createRecord('port-event-out', {
        signal:'event',
        direction:'source',
        label:label,
        targetMethod:target,
        module:this
      });
    } else if(signal === 'event' && direction === 'destination') {
      port = this.store.createRecord('port-event-in', {
        signal:'event',
        direction:'destination',
        label:label,
        targetMethod:target,
        module:this
      });
    } else if(signal === 'value' && direction === 'source') {
      port = this.store.createRecord('port-value-out', {
        signal:'value',
        direction:'source',
        label:label,
        targetVariable:target,
        module:this
      });
    } else if(signal === 'value' && direction === 'destination') {
      port = this.store.createRecord('port-value-in', {
        signal:'value',
        direction:'destination',
        label:label,
        targetVariable:target,
        module:this
      });
    }
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
