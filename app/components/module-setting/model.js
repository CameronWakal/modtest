import { alias } from '@ember/object/computed';
import { defineProperty } from '@ember/object';
import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({

  type: 'module-setting', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: attr('string'),
  // a property name on the parent module to read/write
  targetValue: attr('string'),
  module: belongsTo('module', { async: false, polymorphic: true }),
  minValue: attr('number'),
  maxValue: attr('number'),

  init() {
    this._super(...arguments);
    // make an alias from this.value to module.targetValue at runtime
    let targetPath = `module.${this.targetValue}`;
    defineProperty(this, 'value', alias(targetPath));
  },

  remove() {
    this.destroyRecord();
  },

  save() {
    this._super({ adapterOptions: { dontPersist: true } });
  }

});
