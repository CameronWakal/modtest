import Ember from 'ember';
import config from './config/environment';

const {
  Router: R
} = Ember;

const Router = R.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('patch', { path: '/:patch_id' });

  this.route('patches', function() {});
});

export default Router;
