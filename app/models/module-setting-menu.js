import DS from 'ember-data';
import Ember from 'ember';
import ModuleSetting from './module-setting';

export default ModuleSetting.extend({

  type: 'module-setting-menu', //modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
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

  save() {
    this._super({adapterOptions: {dontPersist: true}});
  }

});
