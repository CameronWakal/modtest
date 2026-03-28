// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias } from '@ember/object/computed';
import { defineProperty } from '@ember/object';
import { attr } from '@ember-data/model';
import ModuleSetting from '../module-setting/model';

export default class ModuleSettingMenuModel extends ModuleSetting {
  type = 'module-setting-menu'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  @attr('string') itemsProperty; // a property on the module defining the available menu items

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    // make an alias from this.items to module.itemsProperty at runtime
    let targetPath = `module.${this.itemsProperty}`;
    defineProperty(this, 'items', alias(targetPath));
  }

  save() {
    super.save({ adapterOptions: { dontPersist: true } });
  }
}
