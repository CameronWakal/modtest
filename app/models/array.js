import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  
  length: DS.attr('number', {defaultValue:0}),
  items: DS.hasMany('arrayItem'),

  valueMin: DS.attr('number', {defaultValue:0}),
  valueMax: DS.attr('number', {defaultValue:127}),
  valueStep: DS.attr('number', {defaultValue:1}),

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

  }),

  onAttrChanged: Ember.observer('length', 'valueMin', 'valueMax', 'valueStep', function() {
    if( this.get('hasDirtyAttributes') ) {
      this.save();
    }
  }),

  save() {
    this._super({adapterOptions: {dontPersist: true}});
    if( !this.get('isDeleted') && !this.get('isNew') ) {
      this.get('module').requestSave();
    }
  },

  incrementAll() {
    this.get('items').forEach(item=>{
      if(item.get('value') != null) {
        item.set('value', item.get('value')+1);
      }
    });
  },

  decrementAll() {
    this.get('items').forEach(item=>{
      if(item.get('value') != null) {
        item.set('value', item.get('value')-1);
      }
    });
  },

  shiftForward() {
    let oldValues = this.get('items').mapBy('value');
    this.get('items').forEach((item,index)=>{
      if(index < oldValues.length-1) {
        item.set('value', oldValues[index+1]);
      } else {
        item.set('value', oldValues[0]);
      }
    });
  },

  shiftBackward() {
    let oldValues = this.get('items').mapBy('value');
    this.get('items').forEach((item,index)=>{
      if(index > 0) {
        item.set('value', oldValues[index-1]);
      } else {
        item.set('value', oldValues[oldValues.length-1]);
      }
    });
  },

  remove() {
    this.get('items').toArray().forEach( item => {
      item.destroyRecord();
    });
    this.destroyRecord();
  }

});
