import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  
  length: DS.attr('number', {defaultValue:0}),
  items: DS.hasMany('arrayItem'),
  currentItem: DS.belongsTo('arrayItem', {async:false}),
  module: DS.belongsTo('module', {async:false, polymorphic:true}),

  onLengthChanged: Ember.observer('length', function() {
    let length = this.get('items.length');
    let newLength = this.get('length');

    if(newLength > length) {
      for(let i = length; i < newLength; i++) {
        this.store.createRecord('arrayItem', {array:this, index:i});
      }
    } else if(newLength < length) {
      for(let i = length; i > newLength; i--) {
        this.get('items').popObject();
      }
    } else {
      return;
    }

    this.get('module').save();

  }),

  remove() {
    this.get('items').toArray().forEach( item => {
      item.destroyRecord();
    });
    this.destroyRecord();
  }

});
