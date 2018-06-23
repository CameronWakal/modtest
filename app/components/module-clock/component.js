import { alias } from '@ember/object/computed';
import ModuleGenericComponent from '../module/component';

export default ModuleGenericComponent.extend({

  classNames: ['module-clock'],
  classNameBindings: ['isStarted:started'],

  isStarted: alias('module.isStarted'),
  latestTriggerTime: alias('module.latestTriggerTime'),
  tickDuration: alias('module.tickDuration'),

  actions: {
    start() {
      this.module.start();
    },

    stop() {
      this.module.stop();
    },

    reset() {
      this.module.reset();
    }
  }

});
