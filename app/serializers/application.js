import LFSerializer from 'ember-localforage-adapter/serializers/localforage';
import DS from 'ember-data';
import Ember from 'ember';

const {
  A,
  isNone
} = Ember;

const {
  EmbeddedRecordsMixin
} = DS;

export default LFSerializer.extend(EmbeddedRecordsMixin, {

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

  // Override EmbeddedRecordsMixin._generateSerializedHasMany() to serialize with `type` attribute
  _generateSerializedHasMany(snapshot, relationship) {
    let hasMany = snapshot.hasMany(relationship.key);
    let manyArray = A(hasMany);
    let ret = new Array(manyArray.length);
    let { options: polymorphic } = relationship;

    for (let i = 0; i < manyArray.length; i++) {
      let embeddedSnapshot = manyArray[i];
      let embeddedJson;
      if (polymorphic) {
        embeddedJson = embeddedSnapshot.serialize({ includeId: true, includeType: true });
      } else {
        embeddedJson = embeddedSnapshot.serialize({ includeId: true });
      }
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
  }

});
