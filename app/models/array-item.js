import Model, { belongsTo, attr } from '@ember-data/model';

export default class ArrayItemModel extends Model {
  @attr('number', { defaultValue: null }) value;
  @attr('number') index;
  @belongsTo('array', { async: false, inverse: 'items' }) array;

  get isCurrentItem() {
    if (this.array?.currentIndexes) {
      return this.array.currentIndexes.some((index) => this.index === index);
    }
    return false;
  }

  // mark myself as saved when requested by my managing module.
  save() {
    super.save({ adapterOptions: { dontPersist: true } });
  }

  // ask managing module to save me when my properties have changed.
  // Note: Callers (UI components) are responsible for calling requestSave() after updating value
  requestSave() {
    console.log('array-item requestSave');
    if (this.array) {
      this.array.requestSave();
    }
  }
}
