import { notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import { get, computed } from '@ember/object';

export default Component.extend({

  classNames: ['module-settings'],
  classNameBindings: ['isEmpty:empty'],

  isEmpty: computed('module.settings', 'module.valueInPorts', function() {
    return !get(this, 'hasSettings') && !get(this, 'hasPorts');
  }),

  hasSettings: notEmpty('module.settings'),
  hasValueInPorts: notEmpty('module.valueInPorts'),
  hasValueOutPorts: notEmpty('module.valueOutPorts'),
  hasEventInPorts: notEmpty('module.eventInPorts'),
  hasEventOutPorts: notEmpty('module.eventOutPorts'),
  hasPorts: notEmpty('module.ports'),

  actions: {
    titleChanged() {
      this.module.requestSave();
    }
  }

});
