import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.findAll('patch');
  },
  actions: {
    new() {
      let patch = this.store.createRecord('patch', {name: 'my cool patch'});
      patch.save();
    },
    removeCurrentPatch() {
      let currentPatchController = this.controllerFor('patch');
      console.log('- application route removing patch '+currentPatchController.get('model').id);
      currentPatchController.send('removePatch');
    }
  }
});
