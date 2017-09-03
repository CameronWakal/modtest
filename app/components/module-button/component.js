import ModuleGenericComponent from '../module/component';

export default ModuleGenericComponent.extend({

  classNames: ['module-button'],

  actions: {
    trig() {
      this.module.trig();
    }
  }

});
