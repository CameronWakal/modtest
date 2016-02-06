import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  
  value: DS.attr('number'),
  index: DS.attr('number'),
  scale: DS.belongsTo('module-scale', {async:false, inverse:'degrees'}),

  isCurrentDegree: Ember.computed('scale.currentDegree', function(){
    return this === this.get('scale.currentDegree');
  })

});
