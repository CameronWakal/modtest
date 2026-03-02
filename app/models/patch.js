import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  title: attr('string', { defaultValue: 'Untitled Patch' }),

  // Explicitly set async: true since modules are stored separately with ids-and-types
  // Use inverse: null for polymorphic relationships to avoid Ember Data 4.x deprecations
  modules: hasMany('module', { polymorphic: true, inverse: null, async: true }),
  busses: hasMany('module-bus', { async: true, inverse: null }),

  // Flag to track if this record was just created and needs initialization
  _needsInit: false,

  init() {
    this._super(...arguments);
    // Use _needsInit flag set by createPatch() instead of relationship state
    // This avoids issues with async relationships during init()
    if (this._needsInit) {
      // create bus modules for routing invisible bus connections
      let resetBus = this.store.createRecord('module-bus', { patch: this, shouldAutoSave: true, title: 'reset bus' });
      // Access content directly for async relationships
      const bussesArray = this.busses.content || this.busses;
      bussesArray.push(resetBus);
      this._needsInit = false;
      this.save();
    }
  },

  save() {
    if (!this.isDeleted) {
      console.log('patch save');
    } else {
      console.log('patch delete');
    }
    return this._super();
  }

});
