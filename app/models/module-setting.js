import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  
  label: DS.attr('string'),
  type: Ember.computed.alias('constructor.modelName'),
  module: DS.belongsTo('module', {async:false, polymorphic:true}),
  isNumber: Ember.computed(function(){
    //todo: fully replace module-setting-number with module-setting-numberref
    return this.get('type') === 'module-setting-number' || this.get('type') === 'module-setting-numberref';
  }),

  remove() {
    this.destroyRecord();
  },

});
