import Ember from 'ember';
import { initialize } from '../../../instance-initializers/prefetch';
import { module } from 'qunit';
import test from 'dummy/tests/ember-sinon-qunit/test';

var application, instance;

module('Unit | Instance Initializer | prefetch', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      instance = application.buildInstance();
    });
  },
  afterEach() {
    Ember.run(function() {
      application.destroy();
      application = null;
      instance.destroy();
      instance = null;
    });
  },
});

test('the prefetch hook is invoked', function(assert) {
  assert.expect(3);

  initialize(instance);

  const router = instance.lookup('router:main');
  const promise = new Ember.RSVP.resolve(1);
  const runSharedModelHook = this.stub().returns(promise);
  const handler = {};
  const handlerInfos = [{
    runSharedModelHook,
    handler,
  }, {
    runSharedModelHook,
    handler,
  }];
  const transition = { handlerInfos };

  router.trigger('willTransition', transition);

  assert.ok(runSharedModelHook.calledTwice, 'handlerInfo.runSharedModelHook is called once per handlerInfo');
  assert.ok(runSharedModelHook.calledWith(transition, 'prefetch'), 'handlerInfo.runSharedModelHook is called with the transition and "prefetch"');
  assert.equal(handler._prefetched, promise, 'the promise is set on the handler as _prefetched');
});

test('handler._prefetched._prefetchReturnedUndefined is set correctly', function(assert) {
  assert.expect(2);

  initialize(instance);

  const router = instance.lookup('router:main');
  const handler = {};

  // simulate prefetch returning a value
  const resolvedWithValue = new Ember.RSVP.resolve(1);
  const runSharedModelHookWithValue = this.stub().returns(resolvedWithValue);
  const handlerInfosWithValue = [{
    runSharedModelHook: runSharedModelHookWithValue,
    handler,
  }];
  const transitionWithValue = { handlerInfos: handlerInfosWithValue };

  router.trigger('willTransition', transitionWithValue);
  assert.notOk(handler._prefetched._prefetchReturnedUndefined, '_prefetchReturnedUndefined is false because the promise was resolved with something other than undefined');

  // simulate prefetch returning undefined
  const resolvedWithUndefined = new Ember.RSVP.resolve(undefined);
  const runSharedModelHookWithUndefined = this.stub().returns(resolvedWithUndefined);
  const handlerInfosWithUndefined = [{
    runSharedModelHook: runSharedModelHookWithUndefined,
    handler,
  }];
  const transitionWithUndefined = { handlerInfos: handlerInfosWithUndefined };

  router.trigger('willTransition', transitionWithUndefined);
  assert.ok(handler._prefetched._prefetchReturnedUndefined, '_prefetchReturnedUndefined is true because the promise was resolved with undefined');
});
