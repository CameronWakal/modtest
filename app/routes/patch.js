import Ember from 'ember';

export default Ember.Route.extend({

  afterModel: function(patch, transition) {
    return patch.get('modules');
  }

});
