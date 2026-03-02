import ApplicationSerializer from '../../serializers/application';

// Port types that we auto-serialize/restore belongsTo relationships for
const PORT_TYPES = ['port-event-in', 'port-event-out', 'port-value-in', 'port-value-out'];
const PORT_GROUP_TYPE = 'port-group';

export default ApplicationSerializer.extend({

  attrs: {
    portGroups: { embedded: 'always' },
    settings: { embedded: 'always' }
  },

  // Auto-serialize belongsTo relationships to ports and port-groups as IDs
  serialize(snapshot, options) {
    let json = this._super(...arguments);

    const modelClass = this.store.modelFor(snapshot.modelName);
    modelClass.eachRelationship((key, relationship) => {
      if (relationship.kind === 'belongsTo') {
        let relatedType = relationship.type;
        if (PORT_TYPES.includes(relatedType) || relatedType === PORT_GROUP_TYPE) {
          let belongsTo = snapshot.belongsTo(key);
          if (belongsTo) {
            json[key] = belongsTo.id;
            json[`${key}_type`] = belongsTo.modelName;
          }
        }
      }
    });

    return json;
  },

  normalize(modelClass, resourceHash) {
    // Ensure settings is always an array to avoid EmbeddedRecordsMixin warning
    if (!resourceHash.settings) {
      resourceHash.settings = [];
    }

    // Deep clone embedded data to preserve original before EmbeddedRecordsMixin processes it
    let originalPortGroups = null;
    let originalSettings = null;
    let moduleId = resourceHash.id;

    if (resourceHash.portGroups && Array.isArray(resourceHash.portGroups)) {
      originalPortGroups = JSON.parse(JSON.stringify(resourceHash.portGroups));
    }
    if (resourceHash.settings && Array.isArray(resourceHash.settings)) {
      originalSettings = JSON.parse(JSON.stringify(resourceHash.settings));
    }

    // Let EmbeddedRecordsMixin process the embedded records
    let result = this._super(...arguments);

    let store = this.store;

    // Push port groups and ports from the original data to update any empty shells
    if (originalPortGroups) {
      let moduleType = resourceHash.type || modelClass.modelName;
      originalPortGroups.forEach((portGroup) => {
        // Ensure portGroup has module relationship
        this._pushPortGroup(store, portGroup, moduleId, moduleType);
        this._pushPorts(store, portGroup.basePorts, portGroup.id);
        this._pushPorts(store, portGroup.expansionPorts, portGroup.id);
      });
    }

    // Push settings from the original data to update any empty shells
    if (originalSettings) {
      // Use modelClass.modelName as resourceHash.type may not be set
      let moduleType = resourceHash.type || modelClass.modelName;
      this._pushSettings(store, originalSettings, moduleId, moduleType);
    }

    // Restore belongsTo relationships to ports and port-groups
    this._restorePortRelationships(result, resourceHash, modelClass);

    return result;
  },

  _pushSettings(store, settings, moduleId, moduleType) {
    if (!settings || !Array.isArray(settings)) return;

    settings.forEach((setting) => {
      if (setting && typeof setting === 'object' && setting.id) {
        let settingData = {
          id: setting.id,
          type: setting.type || 'module-setting',
          attributes: this._extractAttributes(setting),
          relationships: {
            module: {
              data: { id: moduleId, type: moduleType }
            }
          }
        };
        try {
          store.push({ data: settingData });
        } catch (e) {
          // Silently ignore - setting may already exist with correct data
        }
      }
    });
  },

  _pushPortGroup(store, portGroup, moduleId, moduleType) {
    if (!portGroup || !portGroup.id) return;

    let portGroupData = {
      id: portGroup.id,
      type: 'port-group',
      attributes: {
        portSetsCount: portGroup.portSetsCount,
        minSets: portGroup.minSets,
        maxSets: portGroup.maxSets
      },
      relationships: {
        module: {
          data: { id: moduleId, type: moduleType }
        }
      }
    };

    try {
      store.push({ data: portGroupData });
    } catch (e) {
      // Silently ignore - portGroup may already exist with correct data
    }
  },

  _pushPorts(store, ports, portGroupId) {
    if (!ports || !Array.isArray(ports)) return;

    ports.forEach((port) => {
      if (port && typeof port === 'object' && port.id && port.type) {
        let portData = {
          id: port.id,
          type: port.type,
          attributes: this._extractAttributes(port),
          relationships: {
            portGroup: {
              data: { id: portGroupId, type: 'port-group' }
            }
          }
        };

        // Include connections relationship if present
        if (port.connections && Array.isArray(port.connections) && port.connections.length > 0) {
          let connectionType = this._getConnectionType(port.type);
          portData.relationships.connections = {
            data: port.connections.map((connId) => ({
              id: typeof connId === 'object' ? connId.id : connId,
              type: typeof connId === 'object' ? connId.type : connectionType
            }))
          };
        }

        try {
          store.push({ data: portData });
        } catch (e) {
          // Silently ignore - port may already exist with correct data
        }
      }
    });
  },

  // Get the connection target type based on port type
  _getConnectionType(portType) {
    switch (portType) {
      case 'port-event-in': return 'port-event-out';
      case 'port-event-out': return 'port-event-in';
      case 'port-value-in': return 'port-value-out';
      case 'port-value-out': return 'port-value-in';
      default: return 'port';
    }
  },

  // Handle modules with no settings - ensure settings is always serialized as an array
  serializeHasMany(snapshot, json, relationship) {
    if (relationship.key === 'settings') {
      let hasMany = snapshot.hasMany('settings');
      if (!hasMany || hasMany.length === 0) {
        json.settings = [];
        return;
      }
    }
    this._super(...arguments);
  },

  // Restore belongsTo relationships to ports and port-groups from serialized IDs
  _restorePortRelationships(result, resourceHash, modelClass) {
    if (!result.data || !result.data.relationships) {
      result.data = result.data || {};
      result.data.relationships = result.data.relationships || {};
    }

    modelClass.eachRelationship((key, relationship) => {
      if (relationship.kind === 'belongsTo') {
        let relatedType = relationship.type;
        if (PORT_TYPES.includes(relatedType) || relatedType === PORT_GROUP_TYPE) {
          // Check if we have a serialized ID for this relationship
          let portId = resourceHash[key];
          let portType = resourceHash[`${key}_type`] || relatedType;

          if (portId) {
            result.data.relationships[key] = {
              data: { id: portId, type: portType }
            };
          }
        }
      }
    });
  },

  // Extract attributes from a raw JSON object (excluding id, type, and relationship keys)
  _extractAttributes(obj) {
    let attributes = {};
    let relationshipKeys = ['connections', 'portGroup', 'portGroup_type', 'module', 'module_type'];

    Object.keys(obj).forEach((key) => {
      if (key !== 'id' && key !== 'type' && !relationshipKeys.includes(key)) {
        let value = obj[key];
        // Ensure label is always a string (handles numeric labels like 0, 1, 2)
        if (key === 'label' && typeof value === 'number') {
          value = String(value);
        }
        attributes[key] = value;
      }
    });

    return attributes;
  }

});
