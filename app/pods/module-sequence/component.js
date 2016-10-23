import Ember from 'ember';
import ModuleGenericComponent from '../module/component';

export default ModuleGenericComponent.extend({

  classNames: ['module-sequence'],

  onLayoutChanged: Ember.observer( 'module.steps.length', 'module.inputType', 'module.displayScale', function() {
    this.sendAction('layoutChanged');
  })

});
