import Ember from 'ember';
import ModuleGenericComponent from '../module/component';

//todo: computed properties, getters and setters to be more emberlike

export default ModuleGenericComponent.extend({

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
    },
  },

});
