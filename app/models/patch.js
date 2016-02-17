import DS from 'ember-data';

export default DS.Model.extend({
  modules: DS.hasMany('module', {polymorphic: true}),
});
