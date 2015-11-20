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
  assert.expect(4);

  initialize(instance);

  const router = instance.lookup('router:main');
  const promise1 = new Ember.RSVP.resolve(1);
  const runSharedModelHook1 = this.stub().returns(promise1);
  const handler1 = {};
  const promise2 = new Ember.RSVP.resolve(1);
  const runSharedModelHook2 = this.stub().returns(promise2);
  const handler2 = {};
  const handlerInfos = [{
    runSharedModelHook: runSharedModelHook1,
    handler: handler1,
    name: 'route1',
  }, {
    runSharedModelHook: runSharedModelHook2,
    handler: handler2,
    name: 'route2',
  }];
  const transition = { handlerInfos };

  router.trigger('willTransition', transition);

  assert.ok(runSharedModelHook1.calledOnce && runSharedModelHook2.calledOnce, 'handlerInfo.runSharedModelHook is called once per handlerInfo');
  assert.ok(runSharedModelHook1.calledWith(transition, 'prefetch') && runSharedModelHook2.calledWith(transition, 'prefetch'), 'handlerInfo.runSharedModelHook is called with the transition and "prefetch"');
  assert.equal(handler1.prefetched, promise1, 'promise1 is set on handler1 as prefetched');
  assert.equal(handler2.prefetched, promise2, 'promise2 is set on handler2 as prefetched');
});

test('handler.prefetched._prefetchReturnedUndefined is set correctly', function(assert) {
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
  assert.notOk(handler.prefetched._prefetchReturnedUndefined, '_prefetchReturnedUndefined is false because the promise was resolved with something other than undefined');
  router.trigger('didTransition');

  // simulate prefetch returning undefined
  const resolvedWithUndefined = new Ember.RSVP.resolve(undefined);
  const runSharedModelHookWithUndefined = this.stub().returns(resolvedWithUndefined);
  const handlerInfosWithUndefined = [{
    runSharedModelHook: runSharedModelHookWithUndefined,
    handler,
  }];
  const transitionWithUndefined = { handlerInfos: handlerInfosWithUndefined };

  router.trigger('willTransition', transitionWithUndefined);
  assert.ok(handler.prefetched._prefetchReturnedUndefined, '_prefetchReturnedUndefined is true because the promise was resolved with undefined');
  router.trigger('didTransition');
});
