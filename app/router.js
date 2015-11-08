import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('patch', { path: '/:patch_id' });

  this.route('patches', function() {});
});

export default Router;
