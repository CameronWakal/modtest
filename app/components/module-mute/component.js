import ModuleGenericComponent from '../module/component';
import { action } from '@ember/object';

export default ModuleGenericComponent.extend({

  classNames: ['module-mute'],

  @action
  mute() {
    this.module.toggleProperty('isMuted');
  }

});
