import { alias } from '@ember/object/computed';
import { get, defineProperty } from '@ember/object';
import DS from 'ember-data';

const {
  Model,
  attr,
  belongsTo
} = DS;

export default Model.extend({

  type: 'module-setting', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: attr('string'),
  // a property name on the parent module to read/write
  targetValue: attr('string'),
  module: belongsTo('module', { async: false, polymorphic: true }),

  ready() {
    // make an alias from this.value to module.targetValue at runtime
    let targetPath = `module.${get(this, 'targetValue')}`;
    defineProperty(this, 'value', alias(targetPath));
  },

  remove() {
    this.destroyRecord();
  },

  save() {
    this._super({ adapterOptions: { dontPersist: true } });
  }

});
