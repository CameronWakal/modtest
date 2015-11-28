import LFSerializer from 'ember-localforage-adapter/serializers/localforage';
import DS from 'ember-data';
import Ember from 'ember';

export default LFSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    port: { embedded: 'always' },
    out: { embedded: 'always' },
    clock: { embedded: 'always' },
    sequence: { embedded: 'always' },
    step: { embedded: 'always' }
  },

  //redefine JSONSerializer method to support polymorphic hasMany relationship types
  serializeHasMany: function(snapshot, json, relationship) {
    let key = relationship.key;

    if (this._shouldSerializeHasMany(snapshot, key, relationship)) {
      var hasMany = snapshot.hasMany(key);
      if (hasMany !== undefined) {
        // if provided, use the mapping provided by `attrs` in
        // the serializer
        var payloadKey = this._getMappedKey(key, snapshot.type);
        if (payloadKey === key && this.keyForRelationship) {
          payloadKey = this.keyForRelationship(key, "hasMany", "serialize");
        }

        //serialize the IDs
        let hasManyIds = hasMany.map(function(snapshot){
          return snapshot.id;
        });
        json[payloadKey] = hasManyIds;

        //serialize the types, if polymorphic
        if(relationship.options.polymorphic) {
          hasMany = snapshot.hasMany(key);
          let hasManyTypes = hasMany.map(function(snapshot){
            return snapshot.modelName;
          });
          json[payloadKey + "_type"] = hasManyTypes;
        }

      }
    }
  }, 

  //From http://stackoverflow.com/questions/22976663/store-polymorphic-hasmany-an-ember-bug
  /*
  getRelated: function(record, key) {
    var related;
    related = Ember.get(record, key);
    if ((related != null ? related.then : void 0) != null) {
      if (!related.isFulfilled) {
        related = record.get('data')[key];
      } else {
        related = related.content;
      }
    }
    return related;
  },

  getRelatedId: function(related) {
    return related.id || related;
  },

  serializeBelongsTo: function(record, json, relationship) {
    var belongsTo, key;
    key = relationship.key;
    belongsTo = this.getRelated(record, key);
    key = (typeof this.keyForRelationship === "function" ? this.keyForRelationship(key) : void 0) || key;
    if (Ember.isNone(belongsTo)) {
      json[key] = belongsTo;
    } else {
      json[key] = this.getRelatedId(belongsTo);
    }
    if (relationship.options.polymorphic) {
      return this.serializePolymorphicType(record, json, relationship);
    }
  },

  serializeHasMany: function(record, json, relationship) {
    var key, related, relationshipType;
    key = relationship.key;

    relationshipType = DS.RelationshipChange.determineRelationshipType(record.constructor, relationship);
    if (relationshipType === "manyToNone" || relationshipType === "manyToMany") {
      related = this.getRelated(record, key);
      if (Ember.isNone(related)) {
        json[key] = related;
      } else {
        json[key] = related.mapBy("id");
        if (relationship.options.polymorphic) {
          this.serializePolymorphicType(record, json, relationship);
        }
      }
    }
  },

  serializePolymorphicType: function(record, json, relationship) {
    console.log('serializePolymorphicType');
    var convert, key, kind, related;
    key = relationship.key;
    kind = relationship.kind;
    convert = (function(_this) {
      return function(related) {
        var typeKey;
        if (!Ember.isNone(related)) {
          typeKey = related.constructor.typeKey || related.type;
          return {
            id: _this.getRelatedId(related),
            type: typeKey
          };
        } else {
          return related;
        }
      };
    })(this);
    related = this.getRelated(record, key);
    key = (typeof this.keyForAttribute === "function" ? this.keyForAttribute(key) : void 0) || key;
    if (kind === 'belongsTo') {
      return json[key] = convert(related);
    } else if (kind === 'hasMany') {
      return json[key] = related.content.map(function(rel) {
        return convert(rel);
      });
    } else {
      return Ember.assert('Relationship kind {#relationship.kind} not supported yet', false);
    }
  }
  */

});