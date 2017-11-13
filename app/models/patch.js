import { get } from '@ember/object';
import DS from 'ember-data';

const {
  Model,
  hasMany,
  attr
} = DS;

export default Model.extend({
  title: attr('string', { defaultValue: 'Untitled Patch' }),

  modules: hasMany('module', { polymorphic: true }),

  save() {
    if (!get(this, 'isDeleted')) {
      console.log('patch save');
    } else {
      console.log('patch delete');
    }
    this._super();
  }

});
