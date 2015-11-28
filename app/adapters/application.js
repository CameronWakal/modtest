import LFAdapter from 'ember-localforage-adapter/adapters/localforage';

export default LFAdapter.extend({
  namespace: 'modtest',
  //createRecord: updateOrCreatePolymorphic,
  //updateRecord: updateOrCreatePolymorphic
});

function updateOrCreatePolymorphic(store, type, snapshot) {
  console.log('update or create polymorphic');
  if(snapshot.modelName === 'module-sequence') {
    console.log(type);
  }
  return this.queue.attach((resolve, reject) => {
    this._namespaceForType(type).then((namespaceRecords) => {
      var serializer = store.serializerFor(type.modelName);
      var recordHash = serializer.serialize(snapshot, {includeId: true});
      // update(id comes from snapshot) or create(id comes from serialization)
      var id = snapshot.id || recordHash.id;

      namespaceRecords.records[id] = recordHash;
      this.persistData(type, namespaceRecords).then(function () {
        resolve();
      });
    });
  });
}
