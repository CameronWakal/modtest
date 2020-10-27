import ModuleGenericComponent from '../module/component';
import { action } from '@ember/object';

export default ModuleGenericComponent.extend({

  classNames: ['module-analyst'],

  @action
  selectKey(index) {
    this.module.setSelectedKey(index);
  }

});
