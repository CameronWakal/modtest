import Ember from 'ember';
import ModuleGenericComponent from '../module/component';

const {
  observer
} = Ember;

export default ModuleGenericComponent.extend({

  classNames: ['module-sequence'],

  onLayoutChanged: observer('module.steps.length', 'module.inputType', 'module.displayScale', function() {
    this.sendAction('layoutChanged');
  })

});
