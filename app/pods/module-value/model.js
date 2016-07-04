import DS from 'ember-data';
import Module from '../module/model';

export default Module.extend({
  
  label: 'Value', 
  value: DS.attr('number'),

  getValue() {
    console.log('get value', this.get('value'));
    return this.get('value');
  },

  didCreate() {
    //create ports
    this.addValueOutPort('value', 'getValue', true);

    this.save();
  },

});
