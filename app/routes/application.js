import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.findAll('patch');
  },
  
  midi: Ember.inject.service(),

  init() {
    //initialize midi service
    this.get('midi').setup();
    this._super.apply(this, arguments);
  },

  actions: {
    newPatch() {
      let patch = this.store.createRecord('patch');
      patch.save();
      this.transitionTo('patch', patch);
    },
    removeCurrentPatch() {
      //destroy current patch including modules and ports, leave route
      let currentPatchController = this.controllerFor('patch');
      currentPatchController.send('removeCurrentPatch');
    }
  }
});
