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
      let clockBus = this.store.createRecord(`module-bus`, { patch: this, shouldAutoSave: true, title: 'clock' });
      get(this, 'busses').pushObject(clockBus);
      let resetBus = this.store.createRecord(`module-bus`, { patch: this, shouldAutoSave: true, title: 'reset' });
      get(this, 'busses').pushObject(resetBus);
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
