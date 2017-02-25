import ModuleGenericComponent from '../module/component';

const {
  computed
} = Ember;

export default ModuleGenericComponent.extend({

  classNames: ['module-clock-div'],

  latestTriggerTime: computed.alias('module.latestTriggerTime'),
  triggerDuration: computed.alias('module.triggerDuration')

});
