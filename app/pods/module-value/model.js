import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  observer,
  get
} = Ember;

const {
  attr
} = DS;

export default Module.extend({

  type: 'module-value', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Value',
  value: attr('number'),

  getValue() {
    return get(this, 'value');
  },

  ready() {
    if (get(this, 'isNew')) {
      // create ports
      this.addValueOutPort('value', 'getValue', true);
      console.log('module-value didCreate saveLater');
      this.requestSave();
    }
  },

  onValueChanged: observer('value', function() {

    if (get(this, 'hasDirtyAttributes')) {
      console.log('module-value.onValueChanged() requestSave()');
      this.requestSave();
    }

  })

});
