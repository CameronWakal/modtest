import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({

  patch: DS.belongsTo('patch'),
  ports: DS.hasMany('port', {polymorphic:true, async: true}),

  xPos: DS.attr('number', {defaultValue:0}),
  yPos: DS.attr('number', {defaultValue:0}),

  // flag self for deferred removal if removal is requested
  // while save is in progress
  needsRemoval: false, 

  /*
  eventOutPorts: Ember.computed('ports.@each.constructor.modelName', function(){
    let ports = this.get('ports');
    console.log('eventOutPort computed '+ports);
    return ports.filterBy('constructor.modelName', 'port-event-out');
  }),

  valueOutPorts: Ember.computed('ports.@each.constructor.modelName', function(){
    let ports = this.get('ports');
    console.log('valueOutPort computed '+ports);
    return ports.filterBy('constructor.modelName', 'port-value-out');
  }),
*/

  //portVar is used to easily refer to this specific port from within the module
  addEventOutPort(label, portVar) {
    let port = this.store.createRecord('port-event-out', {
      label:label,
      module:this
    });
    port.save();
    this.get('ports').pushObject(port);
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

  // 'remove' is the same as destroyRecord except that it checks for an in-progress
  // save and waits for it to complete if necessary.
  remove() {
    if(this.get('isSaving')) {
      console.log('tried to remove while saving!');
      this.set('needsRemoval', true);
    } else {
      this.destroyRecord();
    }
  },

  //when the state of isSaving changes, check if this model is flagged for needsRemoval
  removeLater: Ember.observer('isSaving', function(sender, key, value, rev) {
    if( !this.get('isSaving') && this.get('needsRemoval') ){
      this.set('needsRemoval', false);
      this.destroyRecord();
    }
  }),

  deleteRecord() {
    this.get('ports').forEach(function(port) {
      port.destroyRecord();
    });
    this._super();
  },

});
