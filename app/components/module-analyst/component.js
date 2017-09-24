import ModuleGenericComponent from '../module/component';

export default ModuleGenericComponent.extend({

  classNames: ['module-analyst'],

  actions: {
    selectKey(index) {
      this.module.setSelectedKey(index);
    }
  }

});
