import Ember from 'ember';
import ModuleGenericComponent from '../module/component';

const {
  observer,
  computed
} = Ember;

export default ModuleGenericComponent.extend({

  classNames: ['module-sequence'],

  latestTriggerTime: computed.alias('module.latestTriggerTime'),
  triggerDuration: computed.alias('module.triggerDuration'),

  onLayoutChanged: observer('module.steps.length', 'module.inputType', 'module.displayScale', function() {
    this.sendAction('layoutChanged');
  })

});
