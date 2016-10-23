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
      console.log('array-item.hasDirtyAttributes - saving');
      this.save();
    }
  }),

  save() {
    this._super({adapterOptions: {dontPersist: true}});
    if( !this.get('isDeleted') ) {
      this.get('array').save();
    }
  }

});
