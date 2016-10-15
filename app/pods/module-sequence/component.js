import ModuleGenericComponent from '../module/component';

export default ModuleGenericComponent.extend({

  classNames: ['module-sequence'],

  onContentChanged: Ember.observer( 'module.steps.length', 'module.inputType', 'module.displayScale', function() {
    this.sendAction('contentChanged');
  })

});
