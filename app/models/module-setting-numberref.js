import DS from 'ember-data';
import Ember from 'ember';
import ModuleSetting from './module-setting';

export default ModuleSetting.extend({
  
    //a property name on the parent module to read/write
    targetValue: DS.attr('string'),

    ready(){
      //make an alias from this.value to module.targetValue at runtime
      let targetPath = 'module.'+this.get('targetValue');
      Ember.defineProperty(this, 'value', Ember.computed.alias(targetPath));
    },
  
});
