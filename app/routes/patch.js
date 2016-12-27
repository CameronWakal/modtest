import Ember from 'ember';

const {
  Route
} = Ember;

export default Route.extend({

  afterModel(patch) {
    return patch.get('modules');
  }

});
