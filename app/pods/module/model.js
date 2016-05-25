import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({

  label: null,
  settings: DS.hasMany('module-setting', {polymorphic:true}),

  patch: DS.belongsTo('patch', {async:false}),
  ports: DS.hasMany('port', {polymorphic:true, async:false}),

  xPos: DS.attr('number', {defaultValue:0}),
  yPos: DS.attr('number', {defaultValue:0}),

  // flag self for deferred removal if removal is requested
  // while save is in progress
  needsRemoval: false,

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
  addEventOutPort(label, portVar) {
    let port = this.store.createRecord('port-event-out', {
      label:label,
      module:this
    });
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
    this.get('ports').pushObject(port);
  },

  //targetVar is checked by the port when a request for the value comes in
  addValueOutPort(label, targetMethod) {
    let port = this.store.createRecord('port-value-out', {
      label:label,
      targetMethod:targetMethod,
      module:this
    });
    this.get('ports').pushObject(port);
  },

  //portVar is used to easily refer to this specific port from within the module
  addValueInPort(label, portVar) {
    let port = this.store.createRecord('port-value-in', {
      label:label,
      module:this
    });
    this.get('ports').pushObject(port);
    this.set(portVar, port);
  },

  addNumberSetting(label, settingVar, defaultValue) {
    let setting = this.store.createRecord('module-setting-number', {
      label:label, 
      value:defaultValue,
    });
    this.get('settings').pushObject(setting);
    this.set(settingVar, setting);
  },

  addNumberrefSetting(label, targetValue, module) {
    let setting = this.store.createRecord('module-setting-numberref', {
      label:label, 
      targetValue:targetValue,
      module:module,
    });
    this.get('settings').pushObject(setting);
  },

  addMenuSetting(label, settingVar, values, selected) {

    let items = Ember.A();
    let selectedItem;
    values.forEach(value=>{
      let item = this.store.createRecord('item-string', { value:value });
      items.pushObject(item);
      if( value === selected ) {
        selectedItem = item;
      }
    });

    let setting = this.store.createRecord('module-setting-menu', {
      label:label,
      items:items,
      selectedItem:selectedItem,
    });

    this.get('settings').pushObject(setting);
    this.set(settingVar, setting);
  },

  remove() {
    if(this.get('isSaving')) {
      console.log('tried to remove while saving!');
      this.set('needsRemoval', true);
    } else {

      this.get('ports').toArray().forEach( port => {
        port.disconnect();
        port.destroyRecord();
      });

      this.get('settings').toArray().forEach( setting => {
        setting.remove();
      });

      this.destroyRecord();
    }
  },

  //when the state of isSaving changes, check if this model is flagged for needsRemoval
  removeLater: Ember.observer('isSaving', function() {
    if( !this.get('isSaving') && this.get('needsRemoval') ){
      this.set('needsRemoval', false);
      this.remove();
    }
  }),

});
