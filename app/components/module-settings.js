import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['module-settings'],
  classNameBindings: ['isEmpty:empty'],

  isEmpty: Ember.computed('module.settings', 'module.valueInPorts', function() {
    return !this.get('hasSettings') && !this.get('hasPorts');
  }),

  hasSettings: Ember.computed.notEmpty('module.settings'),
  hasValueInPorts: Ember.computed.notEmpty('module.valueInPorts'),
  hasValueOutPorts: Ember.computed.notEmpty('module.valueOutPorts'),
  hasEventInPorts: Ember.computed.notEmpty('module.eventInPorts'),
  hasEventOutPorts: Ember.computed.notEmpty('module.eventOutPorts'),
  hasPorts: Ember.computed.notEmpty('module.ports'),

});
