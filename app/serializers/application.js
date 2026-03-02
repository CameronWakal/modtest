import { isNone } from '@ember/utils';
import { A } from '@ember/array';
import LFSerializer from 'ember-localforage-adapter/serializers/localforage';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default LFSerializer.extend(EmbeddedRecordsMixin, {

  // Override to fix deprecated snapshot.type access from ember-localforage-adapter
  shouldSerializeHasMany(snapshot, key, relationship) {
    const modelClass = this.store.modelFor(snapshot.modelName);
    const relationshipType = modelClass.determineRelationshipType(relationship, this.store);

    if (this._mustSerialize(key)) {
      return true;
    }

    return this._canSerialize(key) &&
      (relationshipType === 'manyToNone' ||
        relationshipType === 'manyToMany' ||
        relationshipType === 'manyToOne');
  },

  // Implement JSONSerializer.serializePolymorphicType to include `type` in polymorphic belongsTos
  serializePolymorphicType(snapshot, json, relationship) {
    let { key } = relationship;
    let belongsTo = snapshot.belongsTo(key);
    key = this.keyForAttribute ? this.keyForAttribute(key, 'serialize') : key;
    if (isNone(belongsTo)) {
      json[`${key}_type`] = null;
    } else {
      json[`${key}_type`] = belongsTo.modelName;
    }
  },

  // Override EmbeddedRecordsMixin._generateSerializedHasMany() to:
  // 1. Handle undefined relationships gracefully
  // 2. Include type for polymorphic embedded records
  _generateSerializedHasMany(snapshot, relationship) {
    let hasMany = snapshot.hasMany(relationship.key);
    // Handle undefined/null relationships - return empty array
    if (isNone(hasMany)) {
      return [];
    }
    let manyArray = A(hasMany);
    let ret = new Array(manyArray.length);
    let isPolymorphic = relationship.options && relationship.options.polymorphic;

    for (let i = 0; i < manyArray.length; i++) {
      let embeddedSnapshot = manyArray[i];
      let embeddedJson = embeddedSnapshot.serialize({ includeId: true, includeType: isPolymorphic });
      this.removeEmbeddedForeignKey(snapshot, embeddedSnapshot, relationship, embeddedJson);
      ret[i] = embeddedJson;
    }

    return ret;
  },

  // Override JSONSerializer.serialize() to include `type` attribute if requested
  serialize(snapshot, options) {
    let json = this._super(...arguments);

    if (options && options.includeType) {
      json.type = snapshot.modelName;
    }

    return json;
  },

  // Extract polymorphic type from `key_type` field during normalization
  extractPolymorphicRelationship(relationshipType, relationshipHash, relationshipOptions) {
    // If there's a _type field, use it for the polymorphic type
    if (relationshipHash && relationshipHash.type) {
      return {
        id: relationshipHash.id,
        type: relationshipHash.type
      };
    }
    return this._super(...arguments);
  },

  // Normalize belongsTo relationships to extract polymorphic types from key_type fields
  normalize(modelClass, resourceHash) {
    // Process polymorphic belongsTo relationships - convert key + key_type to proper format
    modelClass.eachRelationship((key, relationshipMeta) => {
      if (relationshipMeta.kind === 'belongsTo' && relationshipMeta.options.polymorphic) {
        let typeKey = `${key}_type`;
        if (resourceHash[typeKey] && resourceHash[key]) {
          // Convert id string to object with id and type
          if (typeof resourceHash[key] === 'string') {
            resourceHash[key] = {
              id: resourceHash[key],
              type: resourceHash[typeKey]
            };
          }
        }
      }
    });
    return this._super(...arguments);
  }

});
