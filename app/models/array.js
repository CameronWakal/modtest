import Model, { attr, hasMany } from '@ember-data/model';
import { addObserver } from '@ember/object/observers';

export default class ArrayModel extends Model {
  @attr('number', { defaultValue: 0 }) length;
  @attr('number', { defaultValue: 0 }) valueMin;
  @attr('number', { defaultValue: 127 }) valueMax;
  @attr('number', { defaultValue: 1 }) valueStep;

  @hasMany('arrayItem', { async: false, inverse: 'array' }) items;

  // the array needs a reference to the parent module to request an embeddedRecords save,
  // but we don't want this to be a belongsTo because of polymorphism problems that started
  // in Ember 3.1. So instead, after an array record is created or when it is loaded, the
  // managing module will set itself as the array's dataManager.
  dataManager = null;

  // the parent model can point this variable to a hasMany of array items if needed.
  // the array will highlight any items that appear in currentItems in the UI.
  get currentIndexes() {
    return this.dataManager?.currentIndexes;
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    addObserver(this, 'length', this._lengthChanged);
  }

  // Set length and sync items immediately (for use during module init)
  setLength(newLength) {
    this.length = newLength;
    this._syncItems();
  }

  _lengthChanged() {
    this._syncItems();
  }

  _syncItems() {
    let length = this.items?.length || 0;
    let newLength = this.length;

    if (newLength > length) {
      for (let i = length; i < newLength; i++) {
        let item = this.store.createRecord('arrayItem', { array: this, index: i });
        // Explicitly add to items in case inverse relationship doesn't sync immediately
        this.items.push(item);
      }
    } else if (newLength < length) {
      for (let i = length; i > newLength; i--) {
        this.items.pop();
      }
    }
  }

  // mark myself as saved when requested by my managing module.
  save() {
    super.save({ adapterOptions: { dontPersist: true } });
    this.items.forEach((item) => {
      item.save();
    });
  }

  // ask managing module to save me when my properties have changed.
  requestSave() {
    console.log('array requestSave');
    if (this.dataManager) {
      this.dataManager.requestSave();
    }
  }

  incrementAll() {
    this.items.forEach((item) => {
      if (item.value != null) {
        item.value = item.value + 1;
      }
    });
  }

  decrementAll() {
    this.items.forEach((item) => {
      if (item.value != null) {
        item.value = item.value - 1;
      }
    });
  }

  shiftForward() {
    let oldValues = this.items.map(item => item.value);
    this.items.forEach((item, index) => {
      if (index < oldValues.length - 1) {
        item.value = oldValues[index + 1];
      } else {
        item.value = oldValues[0];
      }
    });
  }

  shiftBackward() {
    let oldValues = this.items.map(item => item.value);
    this.items.forEach((item, index) => {
      if (index > 0) {
        item.value = oldValues[index - 1];
      } else {
        item.value = oldValues[oldValues.length - 1];
      }
    });
  }

  remove() {
    this.items.slice().forEach((item) => {
      this.store.unloadRecord(item);
    });
    this.store.unloadRecord(this);
  }
}
