import Ember from 'ember';
import { initialize } from '../../../initializers/prefetch';
import { module } from 'qunit';
import test from 'ember-sinon-qunit/test-support/test';

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

test('an Ember#Route\'s default model hook returns its prefetched property', function(assert) {
  assert.expect(1);

  initialize(registry, application);

  const data = {};
  const route = Ember.Route.create({ _prefetched: Ember.RSVP.Promise.resolve(data) });

  return route.model().then((model) => {
    assert.equal(model, data, 'the model hook returns prefetched');
  });
});
