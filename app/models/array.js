import { set, get, observer } from '@ember/object';
import DS from 'ember-data';

const {
  Model,
  attr,
  hasMany,
  belongsTo
} = DS;

export default Model.extend({

  length: attr('number', { defaultValue: 0 }),
  valueMin: attr('number', { defaultValue: 0 }),
  valueMax: attr('number', { defaultValue: 127 }),
  valueStep: attr('number', { defaultValue: 1 }),

  items: hasMany('arrayItem'),
  currentItem: belongsTo('arrayItem', { async: false }),
  module: belongsTo('module', { async: false, polymorphic: true, inverse: null }),

  onLengthChanged: observer('length', function() {
    let length = get(this, 'items.length');
    let newLength = get(this, 'length');

    if (newLength > length) {
      for (let i = length; i < newLength; i++) {
        this.store.createRecord('arrayItem', { array: this, index: i });
      }
    } else if (newLength < length) {
      for (let i = length; i > newLength; i--) {
        get(this, 'items').popObject();
      }
    } else {
      return;
    }

  }),

  onAttrChanged: observer('length', 'valueMin', 'valueMax', 'valueStep', function() {
    if (get(this, 'hasDirtyAttributes') && !get(this, 'isNew')) {
      this.requestSave();
    }
  }),

  // mark myself as saved when requested by my managing module.
  save() {
    this._super({ adapterOptions: { dontPersist: true } });
    get(this, 'items').forEach((item) => {
      item.save();
    });
  },

  // ask managing module to save me when my properties have changed.
  requestSave() {
    console.log('array requestSave');
    get(this, 'module').requestSave();
  },

  incrementAll() {
    get(this, 'items').forEach((item) => {
      if (get(item, 'value') != null) {
        set(item, 'value', get(item, 'value') + 1);
      }
    });
  },

  decrementAll() {
    get(this, 'items').forEach((item) => {
      if (get(item, 'value') != null) {
        set(item, 'value', get(item, 'value') - 1);
      }
    });
  },

  shiftForward() {
    let oldValues = get(this, 'items').mapBy('value');
    get(this, 'items').forEach((item, index) => {
      if (index < oldValues.length - 1) {
        set(item, 'value', oldValues[index + 1]);
      } else {
        set(item, 'value', oldValues[0]);
      }
    });
  },

  shiftBackward() {
    let oldValues = get(this, 'items').mapBy('value');
    get(this, 'items').forEach((item, index) => {
      if (index > 0) {
        set(item, 'value', oldValues[index - 1]);
      } else {
        set(item, 'value', oldValues[oldValues.length - 1]);
      }
    });
  },

  remove() {
    get(this, 'items').toArray().forEach((item) => {
      item.destroyRecord();
    });
    this.destroyRecord();
  }

});
