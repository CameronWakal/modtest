import { filterBy } from '@ember/object/computed';
import { run } from '@ember/runloop';
import { set, computed } from '@ember/object';
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
  //ports: hasMany('port', { polymorphic: true, async: false, inverse: 'module' }),

  portGroups: hasMany('port-group', { async: false }),

  ports: computed('portGroups.@each.ports', function() {
    let ports = [];
    this.portGroups.forEach(function(portGroup) {
      portGroup.ports.forEach(function(port) {
        ports.pushObject(port);
      });
    });
    return ports;
  }),

  eventOutPorts: filterBy('ports', 'type', 'port-event-out'),
  eventInPorts: filterBy('ports', 'type', 'port-event-in'),
  valueOutPorts: filterBy('ports', 'type', 'port-value-out'),
  valueInPorts: filterBy('ports', 'type', 'port-value-in'),
  enabledPorts: filterBy('ports', 'isEnabled', true),
  enabledOutPorts: computed('ports.@each.{type,isEnabled}', function() {
    return this.ports.filter((item) => {
      return item.isEnabled && (item.type === 'port-value-out' || item.type === 'port-event-out');
    });
  }),

  init() {
    this._super(...arguments);
    if (this.isNew) {
      this.addPortGroup();
    }
  },

  didCreate() {
    set(this, 'shouldAutoSave', true);
  },

  didLoad() {
    set(this, 'shouldAutoSave', true);
  },

  // a grouping of ports within the port list, so you can have a degree of control
  // over the order of ports when they're dynamically added or removed
  addPortGroup(options) {
    // have to explicitly define the empty port arrays to avoid an annoying serializer warning:
    // https://github.com/emberjs/data/issues/5173
    let portGroup = this.store.createRecord('port-group', { basePorts: [], expansionPorts: [] });

    if (options && options.minSets) {
      set(portGroup, 'minSets', options.minSets);
    }
    if (options && options.maxSets) {
      set(portGroup, 'maxSets', options.maxSets);
    }
    this.portGroups.pushObject(portGroup);
    portGroup.save();
    return portGroup;
  },

  // portVar is used to easily refer to this specific port from within the module
  addEventOutPort(label, portVar, isEnabled) {
    let port = this.store.createRecord('port-event-out', {
      label,
      isEnabled,
      module: this
    });
    this.ports.pushObject(port);
    this.portGroups.lastObject.addPort(port);
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
    this.ports.pushObject(port);
    this.portGroups.lastObject.addPort(port);
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
    this.ports.pushObject(port);
    this.portGroups.lastObject.addPort(port);
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
    this.ports.pushObject(port);
    this.portGroups.lastObject.addPort(port);
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
      targetValue,
      module
    });
    this.settings.pushObject(setting);
  },

  addMenuSetting(label, targetValue, itemsProperty, module) {
    let setting = this.store.createRecord('module-setting-menu', {
      label,
      targetValue,
      itemsProperty,
      module
    });

    this.settings.pushObject(setting);
  },

  // useful if you're subclassing a module and don't need a setting from the parent
  removeSetting(label) {
    let setting = this.settings.findBy('label', label);
    this.settings.removeObject(setting);
    this.store.findRecord('module-setting', setting.id, { backgroundReload: false }).then(function(setting) {
      setting.destroyRecord();
    });
  },

  requestSave() {
    console.log('module requestSave');
    run.once(this, this.save);
  },

  save() {
    if (this.shouldAutoSave) {
      if (!this.isDeleted) {
        console.log('module saved');
      } else {
        console.log('module deleted');
      }
      this._super();
    }
  },

  remove() {
    this.ports.toArray().forEach((port) => {
      port.disconnect();
      port.destroyRecord();
    });

    this.settings.toArray().forEach((setting) => {
      setting.remove();
    });

    this.destroyRecord();
  }

});
