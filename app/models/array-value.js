import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  
  value: DS.attr('number'),
  index: DS.attr('number'),
  array: DS.belongsTo('array', {async:false, inverse:'inputs'}),

  isCurrentInput: Ember.computed('array.currentInput', function(){
    return this === this.get('array.currentInput');
  })

});
