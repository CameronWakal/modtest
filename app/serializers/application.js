import LFSerializer from 'ember-localforage-adapter/serializers/localforage';
import DS from 'ember-data';
import Ember from 'ember';

const {
  A,
  warn,
  typeOf,
  isNone
} = Ember;

const {
  EmbeddedRecordsMixin
} = DS;

export default LFSerializer.extend(EmbeddedRecordsMixin, {

  // redefine JSONSerializer and Embedded Records Mixin methods to support polymorphic hasMany relationship types
  // if the relationship is polymorphic, it will be represented as an array of objects with ids and types

  serializeHasMany(snapshot, json, relationship) {
    let attr = relationship.key;
    let isPolymorphic = relationship.options.polymorphic;

    if (this.noSerializeOptionSpecified(attr)) {
      this.serializeHasManyUnembedded(snapshot, json, relationship);
      return;
    }
    let includeIds = this.hasSerializeIdsOption(attr);
    let includeRecords = this.hasSerializeRecordsOption(attr);
    let key, hasMany;
    if (includeIds) {
      key = this.keyForRelationship(attr, relationship.kind, 'serialize');
      hasMany = snapshot.hasMany(attr);
      let jsonOutput = A(hasMany).map((rel) => {
        if (isPolymorphic) {
          return { id: rel.id, type: rel.modelName };
        } else {
          return rel.id;
        }
      });
      json[key] = jsonOutput;
    } else if (includeRecords) {
      key = this.keyForAttribute(attr, 'serialize');
      hasMany = snapshot.hasMany(attr);

      warn(
        `The embedded relationship '${key}' is undefined for '${snapshot.modelName}' with id '${snapshot.id}'. Please include it in your original payload.`,
        typeOf(hasMany) !== 'undefined',
        { id: 'ds.serializer.embedded-relationship-undefined' }
      );

      json[key] = A(hasMany).map((embeddedSnapshot) => {
        let embeddedJson = embeddedSnapshot.record.serialize({ includeId: true });
        this.removeEmbeddedForeignKey(snapshot, embeddedSnapshot, relationship, embeddedJson);
        if (isPolymorphic) {
          embeddedJson.type = embeddedSnapshot.modelName;
        }
        return embeddedJson;
      });
    }
  },

  serializeHasManyUnembedded(snapshot, json, relationship) {
    let { key } = relationship;
    let isPolymorphic = relationship.options.polymorphic;

    if (this._shouldSerializeHasMany(snapshot, key, relationship)) {
      let hasMany = snapshot.hasMany(key);
      if (hasMany !== undefined) {
        // if provided, use the mapping provided by `attrs` in
        // the serializer
        let payloadKey = this._getMappedKey(key, snapshot.type);
        if (payloadKey === key && this.keyForRelationship) {
          payloadKey = this.keyForRelationship(key, 'hasMany', 'serialize');
        }

        let hasManyContent;
        if (isPolymorphic) {
          // payload will be an array of objects with ids and types
          hasManyContent = hasMany.map((snapshot) => {
            return { id: snapshot.id, type: snapshot.modelName };
          });
        } else {
          // payload will be an array of ids
          hasManyContent = hasMany.map((snapshot) => {
            return snapshot.id;
          });
        }
        json[payloadKey] = hasManyContent;

      }
    }
  },

  serializeBelongsTo(snapshot, json, relationship) {
    let attr = relationship.key;
    let isPolymorphic = relationship.options.polymorphic;

    if (this.noSerializeOptionSpecified(attr)) {
      this.serializeBelongsToUnembedded(snapshot, json, relationship);
      return;
    }
    let includeIds = this.hasSerializeIdsOption(attr);
    let includeRecords = this.hasSerializeRecordsOption(attr);
    let embeddedSnapshot = snapshot.belongsTo(attr);
    let key;
    if (includeIds) {
      key = this.keyForRelationship(attr, relationship.kind, 'serialize');
      if (!embeddedSnapshot) {
        json[key] = null;
      } else {
        if (isPolymorphic) {
          json[key] = { id: embeddedSnapshot.id, type: embeddedSnapshot.modelName };
        } else {
          json[key] = embeddedSnapshot.id;
        }
      }
    } else if (includeRecords) {
      key = this.keyForAttribute(attr, 'serialize');
      if (!embeddedSnapshot) {
        json[key] = null;
      } else {
        if (isPolymorphic) {
          embeddedSnapshot.type = embeddedSnapshot.modelName;
        }
        json[key] = embeddedSnapshot.record.serialize({ includeId: true });
        this.removeEmbeddedForeignKey(snapshot, embeddedSnapshot, relationship, json[key]);
      }
    }
  },

  serializeBelongsToUnembedded(snapshot, json, relationship) {
    let { key } = relationship;
    let isPolymorphic = relationship.options.polymorphic;

    if (this._canSerialize(key)) {
      let belongsTo = snapshot.belongsTo(key);

      // if provided, use the mapping provided by `attrs` in
      // the serializer
      let payloadKey = this._getMappedKey(key, snapshot.type);
      if (payloadKey === key && this.keyForRelationship) {
        payloadKey = this.keyForRelationship(key, 'belongsTo', 'serialize');
      }

      if (isNone(belongsTo)) {
        // Need to check whether the id is there for new&async records
        json[payloadKey] = null;
      } else if (isPolymorphic) {
        json[payloadKey] = { id: belongsTo.id, type: belongsTo.modelName };
      } else {
        json[payloadKey] = belongsTo.id;
      }
    }
  }

});