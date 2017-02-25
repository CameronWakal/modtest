import DS from 'ember-data';
import Ember from 'ember';

const {
  computed,
  run,
  A,
  set,
  get
} = Ember;

const {
  belongsTo,
  hasMany,
  attr,
  Model
} = DS;

export default Model.extend({

  type: 'module', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: null,
  settings: hasMany('module-setting', { polymorphic: true }),

  patch: belongsTo('patch', { async: false }),
  ports: hasMany('port', { polymorphic: true, async: false }),

  xPos: attr('number', { defaultValue: 0 }),
  yPos: attr('number', { defaultValue: 0 }),

  shouldAutoSave: false,

  eventOutPorts: computed.filterBy('ports', 'type', 'port-event-out'),
  eventInPorts: computed.filterBy('ports', 'type', 'port-event-in'),
  valueOutPorts: computed.filterBy('ports', 'type', 'port-value-out'),
  valueInPorts: computed.filterBy('ports', 'type', 'port-value-in'),
  outPorts: computed('ports.@each.type', function() {
    return get(this, 'ports').filter((item) => {
      return get(item, 'type') === 'port-value-out' || get(item, 'type') === 'port-event-out';
    });
  }),
  enabledPorts: computed.filterBy('ports', 'isEnabled', true),

  didCreate() {
    set(this, 'shouldAutoSave', true);
  },

  didLoad() {
    set(this, 'shouldAutoSave', true);
  },

  // portVar is used to easily refer to this specific port from within the module
  addEventOutPort(label, portVar, isEnabled) {
    let port = this.store.createRecord('port-event-out', {
      label,
      isEnabled,
      module: this
    });
    get(this, 'ports').pushObject(port);
    set(this, portVar, port);
    port.save();
  },

  // targetMethod on the module is called by the port when the event comes in
  addEventInPort(label, targetMethod, isEnabled) {
    let port = this.store.createRecord('port-event-in', {
      label,
      targetMethod,
      isEnabled,
      module: this
    });
    get(this, 'ports').pushObject(port);
    port.save();
  },

  // targetVar is checked by the port when a request for the value comes in
  addValueOutPort(label, targetMethod, isEnabled) {
    let port = this.store.createRecord('port-value-out', {
      label,
      targetMethod,
      isEnabled,
      module: this
    });
    get(this, 'ports').pushObject(port);
    port.save();
  },

  // portVar is used to easily refer to this specific port from within the module
  addValueInPort(label, portVar, options) {
    if (options.isEnabled == null) {
      options.isEnabled = true;
    }
    if (options.canBeEmpty == null) {
      options.canBeEmpty = false;
    }
    let port = this.store.createRecord('port-value-in', {
      label,
      isEnabled: options.isEnabled,
      canBeEmpty: options.canBeEmpty,
      defaultValue: options.defaultValue,
      disabledValue: options.defaultValue,
      minValue: options.minValue,
      maxValue: options.maxValue,
      module: this
    });
    get(this, 'ports').pushObject(port);
    set(this, portVar, port);
    port.save();
  },

  addNumberSetting(label, targetValue, module) {
    let setting = this.store.createRecord('module-setting', {
      label,
      targetValue,
      module
    });
    get(this, 'settings').pushObject(setting);
  },

  addMenuSetting(label, targetValue, module, values) {

    let items = A();
    values.forEach((value) => {
      let item = this.store.createRecord('item-string', { value });
      items.pushObject(item);
    });

    let setting = this.store.createRecord('module-setting-menu', {
      label,
      items,
      module,
      targetValue
    });

    get(this, 'settings').pushObject(setting);
  },

  requestSave() {
    console.log('module requestSave');
    run.once(this, this.save);
  },

  save() {
    if (get(this, 'shouldAutoSave')) {
      if (!get(this, 'isDeleted')) {
        console.log('module saved');
      } else {
        console.log('module deleted');
      }
      this._super();
    }
  },

  remove() {
    get(this, 'ports').toArray().forEach((port) => {
      port.disconnect();
      port.destroyRecord();
    });

    get(this, 'settings').toArray().forEach((setting) => {
      setting.remove();
    });

    this.destroyRecord();
  }

});
