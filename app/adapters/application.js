import LFAdapter from 'ember-localforage-adapter/adapters/localforage';

export default LFAdapter.extend({
  namespace: 'modtest',

  // sending 'dontPersist' adapter option allows you to set the state of an ember data model
  // to saved, without persisting to the api. This is useful for embedded record models that
  // need to be marked as saved, but should only be persisted as embedded records on the parent model.

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.dontPersist) {
      return null;
    }
    return this._super(store, type, snapshot);
  },

  createRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.dontPersist) {
      return null;
    }
    return this._super(store, type, snapshot);
  },

  deleteRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.dontPersist) {
      return null;
    }
    return this._super(store, type, snapshot);
  }

});