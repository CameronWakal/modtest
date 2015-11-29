import LFSerializer from 'ember-localforage-adapter/serializers/localforage';
import DS from 'ember-data';

export default LFSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    port: { embedded: 'always' },
    out: { embedded: 'always' },
    clock: { embedded: 'always' },
    sequence: { embedded: 'always' },
    step: { embedded: 'always' }
  },

  //redefine JSONSerializer method to support polymorphic hasMany relationship types
  //if the hasMany is polymorphic, it will be represented as an array of objects with ids and types
  serializeHasMany: function(snapshot, json, relationship) {
    let key = relationship.key;
    let isPolymorphic = relationship.options.polymorphic;

    if (this._shouldSerializeHasMany(snapshot, key, relationship)) {
      var hasMany = snapshot.hasMany(key);
      if (hasMany !== undefined) {
        // if provided, use the mapping provided by `attrs` in
        // the serializer
        var payloadKey = this._getMappedKey(key, snapshot.type);
        if (payloadKey === key && this.keyForRelationship) {
          payloadKey = this.keyForRelationship(key, "hasMany", "serialize");
        }

        var hasManyContent;
        if(isPolymorphic){
          //payload will be an array of objects with ids and types
          hasManyContent = hasMany.map(function(snapshot){
            return { id: snapshot.id, type: snapshot.modelName };
          });
        } else {
          //payload will be an array of ids
          hasManyContent = hasMany.map(function(snapshot){
            return snapshot.id;
          });
        }
        json[payloadKey] = hasManyContent;

      }
    }
  }

});