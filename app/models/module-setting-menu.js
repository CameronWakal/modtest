import DS from 'ember-data';
import Ember from 'ember';
import ModuleSetting from './module-setting';

export default ModuleSetting.extend({

  items: DS.hasMany('item-string', {async:false}),
  selectedItem: Ember.computed('value', function(){
    return this.get('items').findBy('value',this.get('value'));
  }),

  remove() {
    this.get('items').toArray().forEach(item=>{
      item.destroyRecord();
    });
    this._super();
  },

});
