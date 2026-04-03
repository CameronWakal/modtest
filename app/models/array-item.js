import Model, { belongsTo, attr } from '@ember-data/model';

export default class ArrayItemModel extends Model {
  @attr('number', { defaultValue: null }) value;
  @attr('number') index;
  @belongsTo('array', { async: false, inverse: null }) array;

  get isCurrentItem() {
    if (this.array?.currentIndexes) {
      return this.array.currentIndexes.some((index) => this.index === index);
    }
    return false;
  }
}
