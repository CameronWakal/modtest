import DS from 'ember-data';
import Ember from 'ember';

const {
  observer
} = Ember;

const {
  Model,
  attr,
  hasMany,
  belongsTo
} = DS;

export default Model.extend({

  length: attr('number', { defaultValue: 0 }),
  items: hasMany('arrayItem'),

  valueMin: attr('number', { defaultValue: 0 }),
  valueMax: attr('number', { defaultValue: 127 }),
  valueStep: attr('number', { defaultValue: 1 }),

  currentItem: belongsTo('arrayItem', { async: false }),
  module: belongsTo('module', { async: false, polymorphic: true }),

  onLengthChanged: observer('length', function() {
    let length = this.get('items.length');
    let newLength = this.get('length');

    if (newLength > length) {
      for (let i = length; i < newLength; i++) {
        this.store.createRecord('arrayItem', { array: this, index: i });
      }
    } else if (newLength < length) {
      for (let i = length; i > newLength; i--) {
        this.get('items').popObject();
      }
    } else {
      return;
    }

  }),

  onAttrChanged: observer('length', 'valueMin', 'valueMax', 'valueStep', function() {
    if (this.get('hasDirtyAttributes') && !this.get('isNew')) {
      this.requestSave();
    }
  }),

  // mark myself as saved when requested by my managing module.
  save() {
    this._super({ adapterOptions: { dontPersist: true } });
    this.get('items').forEach((item) => {
      item.save();
    });
  },

  // ask managing module to save me when my properties have changed.
  requestSave() {
    console.log('array requestSave');
    this.get('module').requestSave();
  },

  incrementAll() {
    this.get('items').forEach((item) => {
      if (item.get('value') != null) {
        item.set('value', item.get('value') + 1);
      }
    });
  },

  decrementAll() {
    this.get('items').forEach((item) => {
      if (item.get('value') != null) {
        item.set('value', item.get('value') - 1);
      }
    });
  },

  shiftForward() {
    let oldValues = this.get('items').mapBy('value');
    this.get('items').forEach((item,index) => {
      if (index < oldValues.length - 1) {
        item.set('value', oldValues[index + 1]);
      } else {
        item.set('value', oldValues[0]);
      }
    });
  },

  shiftBackward() {
    let oldValues = this.get('items').mapBy('value');
    this.get('items').forEach((item,index) => {
      if (index > 0) {
        item.set('value', oldValues[index - 1]);
      } else {
        item.set('value', oldValues[oldValues.length - 1]);
      }
    });
  },

  remove() {
    this.get('items').toArray().forEach((item) => {
      item.destroyRecord();
    });
    this.destroyRecord();
  }

});
