import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
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
