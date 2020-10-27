import ModuleGenericComponent from '../module/component';
import { action } from '@ember/object';

export default ModuleGenericComponent.extend({

  classNames: ['module-button'],

  @action
  trig() {
    this.module.trig();
  }

});
