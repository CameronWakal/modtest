import { get, observer, computed } from '@ember/object';
import DS from 'ember-data';

const {
  Model,
  attr,
  belongsTo
} = DS;

export default Model.extend({

  value: attr('number', { defaultValue: null }),
  index: attr('number'),
  array: belongsTo('array', { async: false, inverse: 'items' }),

  isCurrentItem: computed('array.currentItems.@each', function() {
    let currentItems = get (this, 'array.currentItems');
    if (currentItems) {
      return this.array.currentItems.any((item) => this === item);
    }
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
