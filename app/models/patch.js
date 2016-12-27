import DS from 'ember-data';

const {
  Model,
  hasMany
} = DS;

export default Model.extend({
  modules: hasMany('module', { polymorphic: true }),

  save() {
    if (!this.get('isDeleted')) {
      console.log('patch save');
    } else {
      console.log('patch delete');
    }
    this._super();
  }

});
