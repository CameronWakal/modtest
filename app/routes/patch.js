import Ember from 'ember';

export default Ember.Route.extend({

  afterModel(patch){
    return patch.get('modules');
  }

});
