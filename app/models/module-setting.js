import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  
  label: DS.attr('string'),
  value: DS.attr('number'),
  module: DS.belongsTo('module', {async:false, polymorphic:true}),
  targetVariable: DS.attr('string'),

  intValue: Ember.computed('value', function(){
    let intValue = parseInt(this.get('value'));
    return isNaN(intValue) ? null : intValue;
  }),

  onIntValueChanged: Ember.observer('intValue', function() {
    let intValue = this.get('intValue');
    let targetVariable = this.get('targetVariable');
    if(intValue && targetVariable) {
      this.get('module').set(this.get('targetVariable'), intValue);
    }
  }),

});
