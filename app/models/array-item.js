import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  
  value: DS.attr('number'),
  index: DS.attr('number'),
  array: DS.belongsTo('array', {async:false, inverse:'items'}),

  isCurrentItem: Ember.computed('array.currentItem', function(){
    return this === this.get('array.currentItem');
  }),

  onValueChanged: Ember.observer('value', function() {
    if( this.get('hasDirtyAttributes') ) {
      this.requestSave();
    }
  }),

  //mark myself as saved when requested by my managing module.
  save() {
    this._super({adapterOptions: {dontPersist: true}});
  },

  //ask managing module to save me when my properties have changed.
  requestSave() {
    console.log('array-item requestSave');
    this.get('array').requestSave();
  }

});
