import DS from 'ember-data';

export default DS.Model.extend({
  
  length: DS.attr('number'),
  items: DS.hasMany('arrayItem'),
  currentItem: DS.belongsTo('arrayItem', {async:false}),
  module: DS.belongsTo('module', {async:false, polymorphic:true}),

  initItems() {
    //init items
    for(var i = 0; i < this.get('length'); i++) {
      this.store.createRecord('arrayItem', {array:this, index:i});
    }
  }

});
