import Model, { belongsTo, hasMany, attr } from '@ember-data/model';

export default class ModuleModel extends Model {
  type = 'module'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  @attr('string') title;
  @attr('number', { defaultValue: 0 }) xPos;
  @attr('number', { defaultValue: 0 }) yPos;

  @hasMany('module-setting', { polymorphic: true, async: false, inverse: null }) settings;
  @belongsTo('patch', { async: true, inverse: null }) patch;
  @hasMany('port-group', { async: false, inverse: null }) portGroups;

  // Depend on basePorts and expansionPorts directly since @each.ports doesn't track union macro changes
  get ports() {
    let ports = [];
    this.portGroups.forEach(function(portGroup) {
      portGroup.ports.forEach(function(port) {
        ports.push(port);
      });
    });
    return ports;
  }

  get eventOutPorts() {
    return this.ports.filter(p => p.type === 'port-event-out');
  }

  get eventInPorts() {
    return this.ports.filter(p => p.type === 'port-event-in');
  }

  get valueOutPorts() {
    return this.ports.filter(p => p.type === 'port-value-out');
  }

  get valueInPorts() {
    return this.ports.filter(p => p.type === 'port-value-in');
  }

  get enabledPorts() {
    return this.ports.filter(p => p.isEnabled);
  }

  get enabledOutPorts() {
    return this.ports.filter((item) => {
      return item.isEnabled && (item.type === 'port-value-out' || item.type === 'port-event-out');
    });
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    // In Ember Data 4.x, check if truly new by verifying relationships are empty
    // Records loaded from storage will have embedded relationships populated
    if (this.isNew && this.portGroups.length === 0) {
      this.addPortGroup();
    }
    if (this.isNew && this.ports.length === 0) {
      if (this.name) {
        this.title = this.name;
      }
      this.configure();
    }
  }

  // Subclasses override this to set up a new module instance.
  // Called automatically for new records only (not when loading from storage).
  // Use for: creating ports, settings, embedded records, and initial state.
  configure() {
    // Base implementation does nothing
  }

  // A grouping of ports within the port list, so you can have a degree of control
  // over the order of ports when they're dynamically added or removed
  addPortGroup(options) {
    // Have to explicitly define the empty port arrays to avoid an annoying serializer warning:
    // https://github.com/emberjs/data/issues/5173
    let portGroup = this.store.createRecord('port-group', { basePorts: [], expansionPorts: [], module: this });

    if (options && options.minSets) {
      portGroup.minSets = options.minSets;
    }
    if (options && options.maxSets) {
      portGroup.maxSets = options.maxSets;
    }
    this.portGroups.push(portGroup);
    return portGroup;
  }

  // portVar is used to easily refer to this specific port from within the module
  // Pass null for portVar if the port doesn't need a direct reference
  addEventOutPort(label, portVar, isEnabled) {
    let portGroup = this.portGroups.at(-1);
    let port = this.store.createRecord('port-event-out', {
      label,
      isEnabled,
      portGroup
    });
    portGroup.addPort(port);
    if (portVar) {
      this[portVar] = port;
    }
  }

  // targetMethod on the module is called by the port when the event comes in
  addEventInPort(label, targetMethod, isEnabled) {
    let portGroup = this.portGroups.at(-1);
    let port = this.store.createRecord('port-event-in', {
      label,
      targetMethod,
      isEnabled,
      portGroup
    });
    portGroup.addPort(port);
    return port;
  }

  // targetVar is checked by the port when a request for the value comes in
  addValueOutPort(label, targetMethod, isEnabled) {
    let portGroup = this.portGroups.at(-1);
    let port = this.store.createRecord('port-value-out', {
      label,
      targetMethod,
      isEnabled,
      portGroup
    });
    portGroup.addPort(port);
  }

  // Create a value-in-port and add it to the internal list of ports,
  // then assign it to the provided variable.
  addValueInPort(label, portVar, options) {
    let port = this.addValueInPortWithoutAssignment(label, options);
    this[portVar] = port;
  }

  // Create a value-in-port and add it to the internal list of ports,
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
    let portGroup = this.portGroups.at(-1);
    let port = this.store.createRecord('port-value-in', {
      label,
      isEnabled: options.isEnabled,
      canBeEmpty: options.canBeEmpty,
      defaultValue: options.defaultValue,
      disabledValue: options.defaultValue,
      disabledValueChangedMethod: options.disabledValueChangedMethod,
      minValue: options.minValue,
      maxValue: options.maxValue,
      portGroup
    });
    portGroup.addPort(port);
    return port;
  }

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
    this.settings.push(setting);
  }

  addMenuSetting(label, targetValue, itemsProperty, module) {
    let setting = this.store.createRecord('module-setting-menu', {
      label,
      targetValue,
      itemsProperty,
      module
    });

    this.settings.push(setting);
  }

  // Useful if you're subclassing a module and don't need a setting from the parent
  removeSetting(label) {
    let setting = this.settings.find(s => s.label === label);
    const index = this.settings.indexOf(setting);
    if (index !== -1) {
      this.settings.splice(index, 1);
    }
    this.store.unloadRecord(setting);
  }

  remove() {
    // Disconnect ports first so other modules update their connection state
    this.ports.slice().forEach((port) => {
      port.disconnect();
    });

    // Use deleteRecord + save instead of destroyRecord for better Ember Data 4.x compatibility
    this.deleteRecord();
    this.save();
  }
}
