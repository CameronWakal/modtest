import { alias } from '@ember/object/computed';
import { defineProperty, get } from '@ember/object';
import DS from 'ember-data';
import ModuleSetting from '../module-setting/model';

const {
  attr
} = DS;

export default ModuleSetting.extend({

  type: 'module-setting-menu', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  itemsProperty: attr('string'), // a property on the module defining the available menu items

  init() {
    this._super(...arguments);
    // make an alias from this.items to module.itemsProperty at runtime
    let targetPath = `module.${get(this, 'itemsProperty')}`;
    defineProperty(this, 'items', alias(targetPath));
  },

  save() {
    this._super({ adapterOptions: { dontPersist: true } });
  }

});
