import { get } from '@ember/object';
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

  ready() {
    if (get(this, 'isNew')) {
      // create bus modules for routing invisible bus connections
      let resetBus = this.store.createRecord('module-bus', { patch: this, shouldAutoSave: true, title: 'reset bus' });
      get(this, 'busses').pushObject(resetBus);
      this.save();
    }
  },

  save() {
    if (!get(this, 'isDeleted')) {
      console.log('patch save');
    } else {
      console.log('patch delete');
    }
    this._super();
  }

});
