import { alias } from '@ember/object/computed';
import ModuleGenericComponent from '../module/component';

export default ModuleGenericComponent.extend({

  classNames: ['module-repeat'],

  latestTriggerTime: alias('module.latestTriggerTime'),
  triggerDuration: alias('module.triggerDuration')

});
