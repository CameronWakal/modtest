import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  
  label: DS.attr('string'),
  type: Ember.computed.alias('constructor.modelName'),
  isNumber: Ember.computed(function(){
    return this.get('type') === 'module-setting-number';
  }),

});
