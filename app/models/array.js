import DS from 'ember-data';

export default DS.Model.extend({
  
  length: DS.attr('number', {defaultValue: 0}),
  items: DS.hasMany('arrayItem'),
  currentItem: DS.belongsTo('arrayItem', {async:false}),
  module: DS.belongsTo('module', {async:false, polymorphic:true}),

  //todo: array should listen for change to its own property
  //instead of someone else having to call this
  changeLength(newLength) {
    console.log('set length from '+this.get('length')+' to '+newLength);  
    let length = this.get('length');

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

    this.set('length', newLength);
    this.get('module').save();
  },

  remove() {
    this.get('items').toArray().forEach( item => {
      item.destroyRecord();
    });
    this.destroyRecord();
  }

});
