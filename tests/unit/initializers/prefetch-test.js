import { Promise as EmberPromise } from 'rsvp';
import Route from '@ember/routing/route';
import Application from '@ember/application';
import { run } from '@ember/runloop';
import { initialize } from '../../../initializers/prefetch';
import { module } from 'qunit';
import test from 'ember-sinon-qunit/test-support/test';


var registry, application;

module('Unit | Initializer | prefetch', function(hooks) {
  hooks.beforeEach(function() {
    run(function() {
      application = Application.create();
      registry = application.registry;
      application.deferReadiness();
    });
  });

  hooks.afterEach(function() {
    run(function() {
      registry = null;
      application.destroy();
      application = null;
    });
  });

  test('an Ember#Route\'s default model hook returns its prefetched property', function(assert) {
    assert.expect(1);

    initialize(registry, application);

    const data = {};
    const route = Route.create({ _prefetched: EmberPromise.resolve(data) });

    return route.model().then((model) => {
      assert.equal(model, data, 'the model hook returns prefetched');
    });
  });
});
