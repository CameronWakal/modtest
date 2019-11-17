import DS from 'ember-data';

const {
  Model,
  hasMany,
  attr
} = DS;

export default Model.extend({
  title: attr('string', { defaultValue: 'Untitled Patch' }),

  modules: hasMany('module', { polymorphic: true, inverse: 'patch' }),
  busses: hasMany('module-bus'),

  build() {
    // create bus modules for routing invisible bus connections
    let resetBus = this.store.createRecord('module-bus', { patch: this, shouldAutoSave: true, title: 'reset bus' });
    resetBus.build();
    this.busses.pushObject(resetBus);
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
