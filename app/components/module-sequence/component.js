import { alias } from '@ember/object/computed';
import { observer } from '@ember/object';
import ModuleGenericComponent from '../module/component';

export default ModuleGenericComponent.extend({

  classNames: ['module-sequence'],

  latestTriggerTime: alias('module.latestTriggerTime'),
  triggerDuration: alias('module.triggerDuration'),

  onLayoutChanged: observer('module.steps.length', 'module.inputType', 'module.displayScale', function() {
    this.sendAction('layoutChanged');
  })

});
