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
