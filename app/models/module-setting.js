import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  
  label: DS.attr('string'),
  type: 'module-setting', //modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
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

  save() {
    this._super({adapterOptions: {dontPersist: true}});
  }

});
