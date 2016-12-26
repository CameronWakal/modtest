import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({

  type: 'module', //modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: null,
  settings: DS.hasMany('module-setting', {polymorphic:true}),

  patch: DS.belongsTo('patch', {async:false}),
  ports: DS.hasMany('port', {polymorphic:true, async:false}),

  xPos: DS.attr('number', {defaultValue:0}),
  yPos: DS.attr('number', {defaultValue:0}),

  eventOutPorts: Ember.computed.filterBy('ports', 'type', 'port-event-out'),
  eventInPorts: Ember.computed.filterBy('ports', 'type', 'port-event-in'),
  valueOutPorts: Ember.computed.filterBy('ports', 'type', 'port-value-out'),
  valueInPorts: Ember.computed.filterBy('ports', 'type', 'port-value-in'),
  outPorts: Ember.computed('ports.@each.type', function(){
    return this.get('ports').filter( item => {
      return item.get('type') === 'port-value-out' || item.get('type') === 'port-event-out';
    });
  }),
  enabledPorts: Ember.computed.filterBy('ports', 'isEnabled', true),

  //portVar is used to easily refer to this specific port from within the module
  addEventOutPort(label, portVar, isEnabled) {
    let port = this.store.createRecord('port-event-out', {
      label:label,
      isEnabled:isEnabled,
      module:this
    });
    this.get('ports').pushObject(port);
    this.set(portVar, port);
    port.save();
  },

  //targetMethod on the module is called by the port when the event comes in
  addEventInPort(label, targetMethod, isEnabled) {
    let port = this.store.createRecord('port-event-in', {
      label:label,
      targetMethod:targetMethod,
      isEnabled:isEnabled,
      module:this
    });
    this.get('ports').pushObject(port);
    port.save();
  },

  //targetVar is checked by the port when a request for the value comes in
  addValueOutPort(label, targetMethod, isEnabled) {
    let port = this.store.createRecord('port-value-out', {
      label:label,
      targetMethod:targetMethod,
      isEnabled:isEnabled,
      module:this
    });
    this.get('ports').pushObject(port);
    port.save();
  },

  //portVar is used to easily refer to this specific port from within the module
  addValueInPort(label, portVar, isEnabled) {
    let port = this.store.createRecord('port-value-in', {
      label:label,
      isEnabled:isEnabled,
      module:this
    });
    this.get('ports').pushObject(port);
    this.set(portVar, port);
    port.save();
  },

  addNumberSetting(label, targetValue, module) {
    let setting = this.store.createRecord('module-setting', {
      label:label, 
      targetValue:targetValue,
      module:module
    });
    this.get('settings').pushObject(setting);
  },

  addMenuSetting(label, targetValue, module, values) {

    let items = Ember.A();
    values.forEach(value=>{
      let item = this.store.createRecord('item-string', { value:value });
      items.pushObject(item);
    });

    let setting = this.store.createRecord('module-setting-menu', {
      label:label,
      items:items,
      module:module,
      targetValue:targetValue
    });

    this.get('settings').pushObject(setting);
  },

  requestSave() {
    console.log('module requestSave');
    Ember.run.once(this, this.save);
  },

  save() {
    if( !this.get('isDeleted') ) {
      console.log('module saved');
    } else {
      console.log('module deleted');
    }

    this._super();
  },

  remove() {
    this.get('ports').toArray().forEach( port => {
      port.disconnect();
      port.destroyRecord();
    });

    this.get('settings').toArray().forEach( setting => {
      setting.remove();
    });

    this.destroyRecord();
  }

});
