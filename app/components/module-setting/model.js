// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias } from '@ember/object/computed';
import { defineProperty } from '@ember/object';
import Model, { belongsTo, attr } from '@ember-data/model';

export default class ModuleSettingModel extends Model {
  type = 'module-setting'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  @attr('string') label;
  // a property name on the parent module to read/write
  @attr('string') targetValue;
  @belongsTo('module', { async: false, polymorphic: true, inverse: null }) module;
  @attr('number') minValue;
  @attr('number') maxValue;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    // Create a dynamic alias from this.value to module.targetValue
    let targetPath = `module.${this.targetValue}`;
    defineProperty(this, 'value', alias(targetPath));
  }

  remove() {
    // Embedded records are unloaded by parent, but keep method for compatibility
    this.store.unloadRecord(this);
  }

  save() {
    super.save({ adapterOptions: { dontPersist: true } });
  }
}
