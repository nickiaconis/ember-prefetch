import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('foo');
  this.route('bar');
  this.route('queryparams');
  this.route('queryparams-helper');

  this.route('abort-transition-to-child', function() {
    this.route('child');
  });
});

export default Router;
