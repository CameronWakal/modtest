import Ember from 'ember';
import ModuleGenericComponent from '../module/component';

export default ModuleGenericComponent.extend({

  classNames: ['module-clock'],
  classNameBindings: ['isStarted:started'],

  isStarted: Ember.computed.alias('module.isStarted'),

  actions: {
    start() {
      this.get('module').start();
    },

    stop() {
      this.get('module').stop();
    },

    reset() {
      this.get('module').reset();
    }
  }

});
