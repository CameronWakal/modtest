import Ember from 'ember';
import ModuleGenericComponent from '../module/component';

const {
  computed,
  get
} = Ember;

export default ModuleGenericComponent.extend({

  classNames: ['module-clock'],
  classNameBindings: ['isStarted:started'],

  isStarted: computed.alias('module.isStarted'),
  latestTargetTime: computed.alias('module.latestTargetTime'),
  tickDuration: computed.alias('module.tickDuration'),

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
