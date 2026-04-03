import Model, { hasMany, attr } from '@ember-data/model';

export default class PatchModel extends Model {
  @attr('string', { defaultValue: 'Untitled Patch' }) title;

  // Explicitly set async: true since modules are stored separately with ids-and-types
  // Use inverse: null for polymorphic relationships to avoid Ember Data 4.x deprecations
  @hasMany('module', { polymorphic: true, inverse: null, async: true }) modules;
  @hasMany('module-bus', { async: true, inverse: null }) busses;

  // Flag to track if this record was just created and needs initialization
  _needsInit = false;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    // Use _needsInit flag set by createPatch() instead of relationship state
    // This avoids issues with async relationships during init()
    if (this._needsInit) {
      // create bus modules for routing invisible bus connections
      let resetBus = this.store.createRecord('module-bus', { patch: this, title: 'reset bus' });
      // Access content directly for async relationships
      const bussesArray = this.busses.content || this.busses;
      bussesArray.push(resetBus);
      this._needsInit = false;
      this.save();
    }
  }

}
