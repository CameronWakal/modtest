import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  
  value: DS.attr('number'),
  index: DS.attr('number'),
  array: DS.belongsTo('array', {async:false, inverse:'items', polymorphic:true}),

  intValue: Ember.computed('value', function(){
    let intValue = parseInt(this.get('value'));
    return isNaN(intValue) ? null : intValue;
  }),

  isCurrentItem: Ember.computed('array.currentItem', function(){
    return this === this.get('array.currentItem');
  })

});
