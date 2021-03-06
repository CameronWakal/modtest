import { observer, computed } from '@ember/object';
import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({

  value: attr('number', { defaultValue: null }),
  index: attr('number'),
  array: belongsTo('array', { async: false, inverse: 'items' }),

  isCurrentItem: computed('array.currentIndexes.@each', function() {
    if (this.array.currentIndexes) {
      return this.array.currentIndexes.any((index) => this.index == index);
    }
    return false;
  }),

  onValueChanged: observer('value', function() {
    if (this.hasDirtyAttributes) {
      this.requestSave();
    }
  }),

  // mark myself as saved when requested by my managing module.
  save() {
    this._super({ adapterOptions: { dontPersist: true } });
  },

  // ask managing module to save me when my properties have changed.
  requestSave() {
    console.log('array-item requestSave');
    this.array.requestSave();
  }

});
