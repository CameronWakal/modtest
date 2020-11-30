import ModuleGenericComponent from '../module/component';
import {set, action} from '@ember/object';

export default ModuleGenericComponent.extend({

  classNames: ['module-value'],

  @action
  valueInputChanged(newValue) {
    set(this, 'module.value', newValue);
  }

});
