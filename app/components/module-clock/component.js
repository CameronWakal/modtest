import { alias } from '@ember/object/computed';
import { get } from '@ember/object';
import ModuleGenericComponent from '../module/component';

export default ModuleGenericComponent.extend({

  classNames: ['module-clock'],
  classNameBindings: ['isStarted:started'],

  isStarted: alias('module.isStarted'),
  latestTriggerTime: alias('module.latestTriggerTime'),
  tickDuration: alias('module.tickDuration'),

  actions: {
    start() {
      get(this, 'module').start();
    },

    stop() {
      get(this, 'module').stop();
    },

    reset() {
      get(this, 'module').reset();
    }
  }

});
