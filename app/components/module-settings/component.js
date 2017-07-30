import Ember from 'ember';

const {
  Component,
  computed,
  get
} = Ember;

export default Component.extend({

  classNames: ['module-settings'],
  classNameBindings: ['isEmpty:empty'],

  isEmpty: computed('module.settings', 'module.valueInPorts', function() {
    return !get(this, 'hasSettings') && !get(this, 'hasPorts');
  }),

  hasSettings: computed.notEmpty('module.settings'),
  hasValueInPorts: computed.notEmpty('module.valueInPorts'),
  hasValueOutPorts: computed.notEmpty('module.valueOutPorts'),
  hasEventInPorts: computed.notEmpty('module.eventInPorts'),
  hasEventOutPorts: computed.notEmpty('module.eventOutPorts'),
  hasPorts: computed.notEmpty('module.ports'),

  actions: {
    titleChanged() {
      this.module.requestSave();
    }
  }

});
