import ModuleGenericComponent from '../module/component';

export default ModuleGenericComponent.extend({

  classNames: ['module-mute'],

  actions: {
    mute() {
      this.module.toggleProperty('isMuted');
    }
  }

});
