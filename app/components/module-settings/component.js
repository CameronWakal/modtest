import { notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import { computed, action } from '@ember/object';

export default Component.extend({

  classNames: ['module-settings'],
  classNameBindings: ['isEmpty:empty'],

  hasSettings: notEmpty('module.settings'),
  hasValueInPorts: notEmpty('module.valueInPorts'),
  hasValueOutPorts: notEmpty('module.valueOutPorts'),
  hasEventInPorts: notEmpty('module.eventInPorts'),
  hasEventOutPorts: notEmpty('module.eventOutPorts'),
  hasPorts: notEmpty('module.ports'),

  isEmpty: computed('module.{settings,valueInPorts}', function() {
    return !this.hasSettings && !this.hasPorts;
  }),

  @action
  titleChanged() {
    this.module.requestSave();
  }

});
