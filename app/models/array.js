import { set, get, observer } from '@ember/object';
import DS from 'ember-data';
import { alias } from '@ember/object/computed';

const {
  Model,
  attr,
  hasMany
} = DS;

export default Model.extend({

  length: attr('number', { defaultValue: 0 }),
  valueMin: attr('number', { defaultValue: 0 }),
  valueMax: attr('number', { defaultValue: 127 }),
  valueStep: attr('number', { defaultValue: 1 }),

  items: hasMany('arrayItem'),
  // the parent model can point this variable to a hasMany of array items if needed.
  // the array will highlight any items that appear in currentItems in the UI.
  currentIndexes: alias('dataManager.currentIndexes'),
  // the array needs a reference to the parent module to request an embeddedRecords save,
  // but we don't want this to be a belongsTo because of polymorphism problems that started
  // in Ember 3.1. So instead, after an array record is created or when it is loaded, the
  // managing module will set itself as the array's dataManager.
  dataManager: null,

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
    this.dataManager.requestSave();
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
