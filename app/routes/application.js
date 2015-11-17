import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.findAll('patch');
  },
  
  midi: Ember.inject.service(),

  init() {
    //initialize midi service
    this.get('midi').start();
    this._super.apply(this, arguments);
  },

  actions: {
    new() {
      let patch = this.store.createRecord('patch', {name: 'my cool patch'});
      patch.save();
      this.transitionTo('patch', patch);
    },
    removeCurrentPatch() {
      //destroy current patch including modules and ports, leave route
      console.log('- application route removing current patch');

      let currentPatchController = this.controllerFor('patch');
      currentPatchController.send('removeCurrentPatch');
    }
  }
});
