import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  title: attr('string', { defaultValue: 'Untitled Patch' }),

  modules: hasMany('module', { polymorphic: true, inverse: 'patch' }),
  busses: hasMany('module-bus'),

  init() {
    this._super(...arguments);
    if (this.isNew) {
      // create bus modules for routing invisible bus connections
      let resetBus = this.store.createRecord('module-bus', { patch: this, shouldAutoSave: true, title: 'reset bus' });
      this.busses.pushObject(resetBus);
      this.save();
    }
  },

  save() {
    if (!this.isDeleted) {
      console.log('patch save');
    } else {
      console.log('patch delete');
    }
    this._super();
  }

});
