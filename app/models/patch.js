import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  modules: DS.hasMany('module', {polymorphic: true}),
});
