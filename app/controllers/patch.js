import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    
    removePatch() {
      console.log('--- patchController removing patch '+this.model.id);

      this.model.get('modules').forEach(function(item, index) {
        console.log('--- patchController removing module '+item.id);
        item.destroyRecord();
      });

      this.model.destroyRecord();
      this.transitionToRoute('index');
    },
    
    removeModule(module) {
      console.log('--- patchController for '+this.model.id+' removing module '+module.id);

      this.model.get('modules').removeObject(module);
      this.model.save();
      module.destroyRecord();
    },

    addModule(type) {
      let module = this.store.createRecord('module', {patch:this.model, type:type, xPos:5, yPos:10});
      module.save();
      this.model.save();
    }
  }
});
