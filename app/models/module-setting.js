import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  
  label: DS.attr('string'),
  type: Ember.computed.alias('constructor.modelName'),
  module: DS.belongsTo('module', {async:false, polymorphic:true}),
  isNumber: Ember.computed.equal('type','module-setting'),

  //a property name on the parent module to read/write
  targetValue: DS.attr('string'),

  ready(){
    //make an alias from this.value to module.targetValue at runtime
    let targetPath = 'module.'+this.get('targetValue');
    Ember.defineProperty(this, 'value', Ember.computed.alias(targetPath));
  },

  remove() {
    this.destroyRecord();
  }, 

});
