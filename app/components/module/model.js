import { filterBy } from '@ember/object/computed';
import { run } from '@ember/runloop';
import { get, set, computed } from '@ember/object';
import DS from 'ember-data';

const {
  belongsTo,
  hasMany,
  attr,
  Model
} = DS;

export default Model.extend({

  type: 'module', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  shouldAutoSave: false,

  title: attr('string'),
  xPos: attr('number', { defaultValue: 0 }),
  yPos: attr('number', { defaultValue: 0 }),

  settings: hasMany('module-setting', { polymorphic: true }),
  patch: belongsTo('patch', { async: false }),
  ports: hasMany('port', { polymorphic: true, async: false }),

  eventOutPorts: filterBy('ports', 'type', 'port-event-out'),
  eventInPorts: filterBy('ports', 'type', 'port-event-in'),
  valueOutPorts: filterBy('ports', 'type', 'port-value-out'),
  valueInPorts: filterBy('ports', 'type', 'port-value-in'),
  enabledPorts: filterBy('ports', 'isEnabled', true),
  outPorts: computed('ports.@each.type', function() {
    return get(this, 'ports').filter((item) => {
      return get(item, 'type') === 'port-value-out' || get(item, 'type') === 'port-event-out';
    });
  }),

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
    return port;
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

  // create a value-in-port and add it to the internal list of ports,
  // then assign it to the provided variable.
  addValueInPort(label, portVar, options) {
    let port = this.addValueInPortWithoutAssignment(label, options);
    set(this, portVar, port);
  },

  // create a value-in-port and add it to the internal list of ports,
  // but then just return it rather than assigning it to the provided
  // port variable as above. This can be useful if you want to create
  // a dynamic number of ports in a hasMany, for example.
  addValueInPortWithoutAssignment(label, options) {
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
      disabledValueChangedMethod: options.disabledValueChangedMethod,
      minValue: options.minValue,
      maxValue: options.maxValue,
      module: this
    });
    get(this, 'ports').pushObject(port);
    port.save();
    return port;
  },

  addNumberSetting(label, targetValue, module, options) {
    if (options == null) {
      options = {};
    }
    if (options.canBeEmpty == null) {
      options.canBeEmpty = false;
    }
    let setting = this.store.createRecord('module-setting', {
      label,
      canBeEmpty: options.canBeEmpty,
      minValue: options.minValue,
      maxValue: options.maxValue,
      defaultValue: get(module, targetValue),
      targetValue,
      module
    });
    get(this, 'settings').pushObject(setting);
  },

  addMenuSetting(label, targetValue, itemsProperty, module) {
    let setting = this.store.createRecord('module-setting-menu', {
      label,
      targetValue,
      itemsProperty,
      module
    });

    get(this, 'settings').pushObject(setting);
  },

  // useful if you're subclassing a module and don't need a setting from the parent
  removeSetting(label) {
    let settings  = get(this, 'settings');
    let setting = settings.findBy('label', label);
    settings.removeObject(setting);
    this.store.findRecord('module-setting', setting.id, { backgroundReload: false }).then(function(setting) {
      setting.destroyRecord();
    });
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
