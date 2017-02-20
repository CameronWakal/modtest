import DS from 'ember-data';
import Ember from 'ember';

const {
  computed,
  observer,
  get
} = Ember;

const {
  Model,
  attr,
  belongsTo
} = DS;

export default Model.extend({

  value: attr('number'),
  index: attr('number'),
  array: belongsTo('array', { async: false, inverse: 'items' }),

  isCurrentItem: computed('array.currentItem', function() {
    return this === get(this, 'array.currentItem');
  }),

  onValueChanged: observer('value', function() {
    if (get(this, 'hasDirtyAttributes')) {
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
    get(this, 'array').requestSave();
  }

});
