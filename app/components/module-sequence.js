import ModuleGenericComponent from './module-generic';

export default ModuleGenericComponent.extend({

  classNames: ['module-sequence'],
  
  selectedSteps: Ember.computed.filterBy('module.sequence.steps', 'isSelected', true),

  actions: {
    
    selectStep(newStep) {
      let newStepIsSelected = newStep.get('isSelected');

      this.get('selectedSteps').forEach(function(step){
        step.set('isSelected', false);
      });

      newStep.set('isSelected', !newStepIsSelected);
    }
  
  }

});
