import DS from 'ember-data';
import Module from '../module/model';

export default Module.extend({
  
  type: 'module-value', //modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Value', 
  value: DS.attr('number'),

  getValue() {
    console.log('get value', this.get('value'));
    return this.get('value');
  },

  didCreate() {
    //create ports
    this.addValueOutPort('value', 'getValue', true);

    this.saveLater();
  },

});
