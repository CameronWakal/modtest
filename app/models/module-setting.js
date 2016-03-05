import DS from 'ember-data';

export default DS.Model.extend({
  
  label: DS.attr('string'),
  value: DS.attr('number'),
  module: DS.belongsTo('module', {async:false, polymorphic:true}),
  targetVariable: DS.attr('string'),

  onValueChanged: Ember.observer('value', function() {
    let value = this.get('value');
    let targetVariable = this.get('targetVariable');
    if(value && targetVariable) {
      this.get('module').set(this.get('targetVariable'), value);
    }
  }),

});
