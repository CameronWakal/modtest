import Ember from 'ember';

export default Ember.Route.extend({

  afterModel: function(patch) {
    return patch.get('modules');
  }

});
