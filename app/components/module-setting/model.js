import Ember from 'ember';
import DS from 'ember-data';

const {
  computed,
  defineProperty,
  get
} = Ember;

const {
  Model,
  attr,
  belongsTo
} = DS;

export default Model.extend({

  label: attr('string'),
  type: 'module-setting', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  module: belongsTo('module', { async: false, polymorphic: true }),

  // a property name on the parent module to read/write
  targetValue: attr('string'),

  ready() {
    // make an alias from this.value to module.targetValue at runtime
    let targetPath = `module.${get(this, 'targetValue')}`;
    defineProperty(this, 'value', computed.alias(targetPath));
  },

  remove() {
    this.destroyRecord();
  },

  save() {
    this._super({ adapterOptions: { dontPersist: true } });
  }

});
