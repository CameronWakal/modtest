import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

const {
  observer,
  get,
  set
} = Ember;

const {
  attr,
  belongsTo
} = DS;

export default Module.extend({

  type: 'module-value', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Value',
  value: attr('number'),

  valueInPort: belongsTo('port-value-in', { async: false }),

  getValue() {
    return get(this, 'value');
  },

  setValue() {
    let value = get(this, 'valueInPort').getValue();
    set(this, 'value', value);
    this.requestSave();
  },

  ready() {
    if (get(this, 'isNew')) {
      // create ports
      this.addValueInPort('in', 'valueInPort', { canBeEmpty: true });
      this.addEventInPort('set', 'setValue', true);
      this.addValueOutPort('out', 'getValue', true);
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
