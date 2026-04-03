import JSONSerializer from '@ember-data/serializer/json';
import { inject as service } from '@ember/service';

/**
 * Serializer for patch documents.
 * Handles complete document serialization/deserialization with all embedded records.
 *
 * Document structure:
 * {
 *   id: "patch-id",
 *   title: "My Patch",
 *   modules: [
 *     {
 *       id: "module-id",
 *       type: "module-clock",
 *       title: "Clock",
 *       xPos: 100,
 *       yPos: 200,
 *       ...moduleAttributes,
 *       portGroups: [...],
 *       settings: [...]
 *     }
 *   ],
 *   busses: [...]
 * }
 */
export default class PatchSerializer extends JSONSerializer {
  @service store;

  /**
   * Serialize a complete patch document for storage.
   * This is called by the adapter when saving a patch.
   */
  serializePatchDocument(snapshot) {
    const patch = snapshot.record;

    return {
      id: patch.id,
      title: patch.title,
      modules: this._serializeModules(patch),
      busses: this._serializeBusses(patch)
    };
  }

  /**
   * Serialize all modules in a patch.
   */
  _serializeModules(patch) {
    const modules = patch.modules.content || patch.modules;
    return modules.map(module => this._serializeModule(module));
  }

  /**
   * Serialize a single module with all its embedded data.
   */
  _serializeModule(module) {
    const data = {
      id: module.id,
      type: module.constructor.modelName || module.type,
      title: module.title,
      xPos: module.xPos,
      yPos: module.yPos,
      portGroups: this._serializePortGroups(module),
      settings: this._serializeSettings(module)
    };

    // Add module-specific attributes
    this._addModuleSpecificAttributes(module, data);

    return data;
  }

  /**
   * Add module-type-specific attributes to the serialized data.
   */
  _addModuleSpecificAttributes(module, data) {
    // Get all attributes from the model
    module.eachAttribute((name) => {
      if (!['title', 'xPos', 'yPos'].includes(name)) {
        data[name] = module[name];
      }
    });

    // Serialize belongsTo relationships
    module.eachRelationship((name, descriptor) => {
      if (descriptor.kind === 'belongsTo' && name !== 'patch') {
        const related = module[name];
        if (related && related.id) {
          // Check if this is an array relationship - serialize full data
          if (descriptor.type === 'array') {
            data[name] = this._serializeArray(related);
          } else {
            // Store reference by ID - will be resolved on load
            data[name] = related.id;
          }
        }
      }
    });
  }

  /**
   * Serialize an array record (for sequence steps, etc.)
   */
  _serializeArray(arrayRecord) {
    if (!arrayRecord) return null;

    return {
      id: arrayRecord.id,
      length: arrayRecord.length,
      valueMin: arrayRecord.valueMin,
      valueMax: arrayRecord.valueMax,
      valueStep: arrayRecord.valueStep,
      items: (arrayRecord.items || []).map(item => ({
        id: item.id,
        index: item.index,
        value: item.value
      }))
    };
  }

  /**
   * Serialize all port groups for a module.
   */
  _serializePortGroups(module) {
    return module.portGroups.map(pg => this._serializePortGroup(pg));
  }

  /**
   * Serialize a single port group.
   */
  _serializePortGroup(portGroup) {
    return {
      id: portGroup.id,
      minSets: portGroup.minSets,
      maxSets: portGroup.maxSets,
      portSetsCount: portGroup.portSetsCount,
      basePorts: this._serializePorts(portGroup.basePorts),
      expansionPorts: this._serializePorts(portGroup.expansionPorts)
    };
  }

  /**
   * Serialize an array of ports.
   */
  _serializePorts(ports) {
    if (!ports) return [];
    return ports.map(port => this._serializePort(port));
  }

  /**
   * Serialize a single port with all its attributes.
   */
  _serializePort(port) {
    const data = {
      id: port.id,
      type: port.constructor.modelName || port.type,
      label: port.label,
      isEnabled: port.isEnabled
    };

    // Add port-type-specific attributes
    if (data.type === 'port-value-in') {
      data.canBeEmpty = port.canBeEmpty;
      data.defaultValue = port.defaultValue;
      data.minValue = port.minValue;
      data.maxValue = port.maxValue;
      data.disabledValue = port.disabledValue;
      data.disabledValueChangedMethod = port.disabledValueChangedMethod;
    }

    if (data.type === 'port-value-out') {
      data.targetMethod = port.targetMethod;
    }

    if (data.type === 'port-event-in') {
      data.targetMethod = port.targetMethod;
    }

    // Serialize connections (store as array of IDs)
    if (port.connections && port.connections.length > 0) {
      data.connections = port.connections.map(c => c.id);
    }

    return data;
  }

  /**
   * Serialize module settings.
   */
  _serializeSettings(module) {
    return module.settings.map(setting => this._serializeSetting(setting));
  }

  /**
   * Serialize a single setting.
   */
  _serializeSetting(setting) {
    const data = {
      id: setting.id,
      type: setting.constructor.modelName || setting.type,
      label: setting.label,
      targetValue: setting.targetValue
    };

    if (data.type === 'module-setting') {
      data.canBeEmpty = setting.canBeEmpty;
      data.minValue = setting.minValue;
      data.maxValue = setting.maxValue;
    }

    if (data.type === 'module-setting-menu') {
      data.itemsProperty = setting.itemsProperty;
    }

    return data;
  }

  /**
   * Serialize busses (special module type).
   */
  _serializeBusses(patch) {
    const busses = patch.busses.content || patch.busses;
    return busses.map(bus => this._serializeModule(bus));
  }

  /**
   * Push a record to the store with a specific ID.
   * Uses store.push for proper ID handling.
   */
  _pushRecord(type, id, attributes, relationships = null) {
    const store = this.store;

    // Check if record already exists
    let record = store.peekRecord(type, id);
    if (record) {
      // Update existing record attributes only
      Object.keys(attributes).forEach(key => {
        if (key !== 'id' && key !== 'type') {
          record[key] = attributes[key];
        }
      });
      return record;
    }

    // Push new record using JSON:API format
    const payload = {
      data: {
        id,
        type,
        attributes
      }
    };

    // Add relationships if provided
    if (relationships) {
      payload.data.relationships = relationships;
    }

    const pushed = store.push(payload);
    return pushed;
  }

  /**
   * Normalize a patch document from storage into Ember Data format.
   * This pushes all records to the store and returns the patch.
   */
  normalizePatchDocument(document) {
    // First pass: create all records without relationships
    const recordMap = new Map();

    // Create array items first (for steps, degrees, etc.)
    const createArrayItems = (arrayData) => {
      if (arrayData && arrayData.items) {
        arrayData.items.forEach(itemData => {
          const item = this._pushRecord('array-item', itemData.id, {
            index: itemData.index,
            value: itemData.value
          });
          recordMap.set(itemData.id, item);
        });
      }
    };

    // Helper to check if a value looks like a serialized array
    const isSerializedArray = (value) => {
      return value && typeof value === 'object' &&
             value.id && Array.isArray(value.items);
    };

    // Find all serialized arrays in module data
    const findSerializedArrays = (moduleData) => {
      return Object.values(moduleData).filter(isSerializedArray);
    };

    if (document.modules) {
      document.modules.forEach(moduleData => {
        findSerializedArrays(moduleData).forEach(createArrayItems);
      });
    }

    // Create array records
    const createArrayRecord = (arrayData) => {
      if (!arrayData) return;

      const arrayRecord = this._pushRecord('array', arrayData.id, {
        length: arrayData.length,
        valueMin: arrayData.valueMin,
        valueMax: arrayData.valueMax,
        valueStep: arrayData.valueStep
      });

      // Link items to array (both directions since inverse: null)
      const items = arrayData.items.map(i => recordMap.get(i.id));
      items.forEach(item => {
        if (item) {
          item.array = arrayRecord;
          if (!arrayRecord.items.includes(item)) {
            arrayRecord.items.push(item);
          }
        }
      });

      recordMap.set(arrayData.id, arrayRecord);
    };

    if (document.modules) {
      document.modules.forEach(moduleData => {
        findSerializedArrays(moduleData).forEach(createArrayRecord);
      });
    }

    // Create ports
    const allPorts = [];
    const createPorts = (portsData, portGroupId) => {
      return portsData.map(portData => {
        const attrs = {
          label: portData.label,
          isEnabled: portData.isEnabled
        };

        // Add port-specific attributes
        if (portData.type === 'port-value-in') {
          attrs.canBeEmpty = portData.canBeEmpty;
          attrs.defaultValue = portData.defaultValue;
          attrs.minValue = portData.minValue;
          attrs.maxValue = portData.maxValue;
          attrs.disabledValue = portData.disabledValue;
          attrs.disabledValueChangedMethod = portData.disabledValueChangedMethod;
        }
        if (portData.targetMethod) {
          attrs.targetMethod = portData.targetMethod;
        }

        // Include relationship in the push
        const relationships = {
          portGroup: { data: { id: portGroupId, type: 'port-group' } }
        };

        const port = this._pushRecord(portData.type, portData.id, attrs, relationships);

        recordMap.set(portData.id, port);
        allPorts.push({ port, data: portData });
        return port;
      });
    };

    // Create settings
    const createSettings = (settingsData, moduleId, moduleType) => {
      return settingsData.map(settingData => {
        const attrs = {
          label: settingData.label,
          targetValue: settingData.targetValue
        };

        if (settingData.type === 'module-setting') {
          attrs.canBeEmpty = settingData.canBeEmpty;
          attrs.minValue = settingData.minValue;
          attrs.maxValue = settingData.maxValue;
        }
        if (settingData.type === 'module-setting-menu') {
          attrs.itemsProperty = settingData.itemsProperty;
        }

        // Include relationship in the push
        const relationships = {
          module: { data: { id: moduleId, type: moduleType } }
        };

        const setting = this._pushRecord(settingData.type, settingData.id, attrs, relationships);

        recordMap.set(settingData.id, setting);
        return setting;
      });
    };

    // Create port groups
    const createPortGroups = (portGroupsData, moduleId, moduleType) => {
      return portGroupsData.map(pgData => {
        // Include module relationship in the push
        const relationships = {
          module: { data: { id: moduleId, type: moduleType } }
        };

        const portGroup = this._pushRecord('port-group', pgData.id, {
          minSets: pgData.minSets,
          maxSets: pgData.maxSets,
          portSetsCount: pgData.portSetsCount
        }, relationships);

        // Create ports with portGroup ID (ports will set their own relationship)
        const basePorts = createPorts(pgData.basePorts || [], pgData.id);
        const expansionPorts = createPorts(pgData.expansionPorts || [], pgData.id);

        // Add ports to portGroup's hasMany arrays
        basePorts.forEach(p => {
          if (!portGroup.basePorts.includes(p)) {
            portGroup.basePorts.push(p);
          }
        });
        expansionPorts.forEach(p => {
          if (!portGroup.expansionPorts.includes(p)) {
            portGroup.expansionPorts.push(p);
          }
        });

        recordMap.set(pgData.id, portGroup);
        return portGroup;
      });
    };

    // Create modules
    const createModule = (moduleData, patchId) => {
      const attrs = {
        title: moduleData.title,
        xPos: moduleData.xPos,
        yPos: moduleData.yPos
      };

      // Add module-specific attributes
      Object.keys(moduleData).forEach(key => {
        if (!['id', 'type', 'title', 'xPos', 'yPos', 'portGroups', 'settings', 'steps', 'patch'].includes(key)) {
          // Skip port references for now (will be resolved later)
          if (typeof moduleData[key] !== 'string' || !moduleData[key].match(/^[0-9a-f-]{36}$/i)) {
            attrs[key] = moduleData[key];
          }
        }
      });

      // Include patch relationship in the push
      const relationships = {
        patch: { data: { id: patchId, type: 'patch' } }
      };

      const module = this._pushRecord(moduleData.type, moduleData.id, attrs, relationships);

      // Create embedded records (pass IDs, not objects)
      const portGroups = createPortGroups(moduleData.portGroups || [], moduleData.id, moduleData.type);
      const settings = createSettings(moduleData.settings || [], moduleData.id, moduleData.type);

      portGroups.forEach(pg => {
        if (!module.portGroups.includes(pg)) {
          module.portGroups.push(pg);
        }
      });
      settings.forEach(s => {
        if (!module.settings.includes(s)) {
          module.settings.push(s);
        }
      });

      // Link any array relationships
      Object.entries(moduleData).forEach(([key, value]) => {
        if (isSerializedArray(value)) {
          module[key] = recordMap.get(value.id);
          if (module[key]) {
            module[key].dataManager = module;
          }
        }
      });

      recordMap.set(moduleData.id, module);
      return module;
    };

    // Create the patch first
    const patch = this._pushRecord('patch', document.id, {
      title: document.title
    });

    // Create all modules (pass patch ID, not object)
    const modules = (document.modules || []).map(m => createModule(m, document.id));
    const busses = (document.busses || []).map(b => createModule(b, document.id));

    modules.forEach(m => {
      const modulesArray = patch.modules.content || patch.modules;
      if (!modulesArray.includes(m)) {
        modulesArray.push(m);
      }
    });
    busses.forEach(b => {
      const bussesArray = patch.busses.content || patch.busses;
      if (!bussesArray.includes(b)) {
        bussesArray.push(b);
      }
    });

    // Second pass: resolve port connections and module port references
    allPorts.forEach(({ port, data }) => {
      if (data.connections && data.connections.length > 0) {
        data.connections.forEach(connId => {
          const connectedPort = recordMap.get(connId);
          if (connectedPort && !port.connections.includes(connectedPort)) {
            port.connections.push(connectedPort);
          }
        });
      }
    });

    // Resolve module port references (like tempoPort, countInPort, etc.)
    (document.modules || []).concat(document.busses || []).forEach(moduleData => {
      const module = recordMap.get(moduleData.id);
      if (module) {
        Object.keys(moduleData).forEach(key => {
          // Skip id and type - these are not port references
          if (key === 'id' || key === 'type') return;
          if (typeof moduleData[key] === 'string' && recordMap.has(moduleData[key])) {
            module[key] = recordMap.get(moduleData[key]);
          }
        });
      }
    });

    recordMap.set(document.id, patch);
    return patch;
  }
}
