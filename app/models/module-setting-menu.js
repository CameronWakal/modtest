import DS from 'ember-data';
import ModuleSetting from './module-setting';

export default ModuleSetting.extend({

  items: DS.hasMany('item-string', {async:false}),
  selectedItem: DS.belongsTo('item-string'),
  value: Ember.computed.alias('selectedItem.value'),

  remove() {
    this.get('items').toArray().forEach(item=>{
      item.destroyRecord();
    });
    this._super();
  }

});
