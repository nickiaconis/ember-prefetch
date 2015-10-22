import Ember from 'ember';
import { initialize } from '../../../initializers/prefetch';
import { module } from 'qunit';
import test from 'dummy/tests/ember-sinon-qunit/test';

var registry, application;

module('Unit | Initializer | prefetch', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      registry = application.registry;
      application.deferReadiness();
    });
  },
  afterEach() {
    Ember.run(function() {
      registry = null;
      application.destroy();
      application = null;
    });
  },
});

test('a route\'s default model hook returns route.prefetched', function(assert) {
  assert.expect(1);

  initialize(registry, application);

  const data = { _prefetchReturnedUndefined: false };
  const route = Ember.Route.create({ prefetched: data });

  assert.equal(route.model(), data, 'the model hook returns route.prefetched');
});
