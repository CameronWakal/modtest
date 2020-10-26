import { alias } from '@ember/object/computed';
import { action } from '@ember/object';
import ModuleGenericComponent from '../module/component';

export default ModuleGenericComponent.extend({

  classNames: ['module-clock'],
  classNameBindings: ['isStarted:started'],

  isStarted: alias('module.isStarted'),
  latestTriggerTime: alias('module.latestTriggerTime'),
  tickDuration: alias('module.tickDuration'),

  @action
  start() {
    this.module.start();
  },

  @action
  stop() {
    this.module.stop();
  }

});
