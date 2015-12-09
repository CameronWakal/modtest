import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  
  patch: DS.belongsTo('patch'),
  ports: DS.hasMany('port', {polymorphic:true}),

  eventOutputPorts: Ember.computed('ports.@each.constructor.modelName', function(){
    let ports = this.get('ports');
    return ports.filterBy('constructor.modelName', 'port-event-out');
  }),

  //portVar is used to easily refer to this specific port from within the module
  addEventOutPort(label, portVar) {
    let port = this.store.createRecord('port-event-out', {
      label:label,
      module:this
    });
    port.save();
    this.get('ports').pushObject(port);
    console.log('portVar:',portVar,' port:',port);
    this.set(portVar, port);
  },

  //targetMethod on the module is called by the port when the event comes in
  addEventInPort(label, targetMethod) {
    let port = this.store.createRecord('port-event-in', {
      label:label,
      targetMethod:targetMethod,
      module:this
    });
    port.save();
    this.get('ports').pushObject(port);
  },

  //targetVar is checked by the port when a request for the value comes in
  addValueOutPort(label, targetVar) {
    let port = this.store.createRecord('port-value-out', {
      label:label,
      targetVar:targetVar,
      module:this
    });
    port.save();
    this.get('ports').pushObject(port);
  },

  //portVar is used to easily refer to this specific port from within the module
  addValueInPort(label, portVar) {
    let port = this.store.createRecord('port-value-in', {
      label:label,
      module:this
    });
    port.save();
    this.get('ports').pushObject(port);
    this.set(portVar, port);
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
