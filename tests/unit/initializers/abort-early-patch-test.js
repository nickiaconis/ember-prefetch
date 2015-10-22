import Ember from 'ember';
import { initialize } from '../../../initializers/abort-early-patch';
import { module } from 'qunit';
import test from 'dummy/tests/ember-sinon-qunit/test';

var registry, application;

module('Unit | Initializer | abort-early-patch', {
  beforeEach: function() {
    Ember.run(function() {
      application = Ember.Application.create();
      registry = application.registry;
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  initialize(registry, application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
