import DS from 'ember-data';
import Ember from 'ember';
import ModuleSetting from './module-setting';

const {
  computed,
  get,
  defineProperty
} = Ember;

const {
  hasMany,
  attr
} = DS;

export default ModuleSetting.extend({

  type: 'module-setting-menu', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  itemsProperty: attr('string'), // a property on the module defining the available menu items

  ready() {
    this._super();
    // make an alias from this.items to module.itemsProperty at runtime
    let targetPath = `module.${get(this, 'itemsProperty')}`;
    defineProperty(this, 'items', computed.alias(targetPath));
  },

  save() {
    this._super({ adapterOptions: { dontPersist: true } });
  }

});
