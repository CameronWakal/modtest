import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  observer
} = Ember;

const {
  attr
} = DS;

export default Module.extend({

  type: 'module-value', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Value',
  value: attr('number'),

  getValue() {
    return this.get('value');
  },

  ready() {
    if (this.get('isNew')) {
      // create ports
      this.addValueOutPort('value', 'getValue', true);
      console.log('module-value didCreate saveLater');
      this.requestSave();
    }
  },

  onValueChanged: observer('value', function() {

    if (this.get('hasDirtyAttributes')) {
      console.log('module-value.onValueChanged() requestSave()');
      this.requestSave();
    }

  })

});
