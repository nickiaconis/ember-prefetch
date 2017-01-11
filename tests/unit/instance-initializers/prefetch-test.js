import Ember from 'ember';
import { initialize } from '../../../instance-initializers/prefetch';
import { module } from 'qunit';
import test from 'ember-sinon-qunit/test-support/test';
import wait from 'ember-test-helpers/wait';

const { RSVP: { Promise } } = Ember;

let application, instance;

function scheduleMacroTask(task) {
  setTimeout(task, 0);
}

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
  const promise = Promise.resolve(1);
  const runSharedModelHook = this.stub().returns(promise);
  const handler1 = {};
  const handler2 = {};
  const handlerInfos = [{
    runSharedModelHook,
    handler: handler1,
  }, {
    runSharedModelHook,
    handler: handler2,
  }];
  const transition = { handlerInfos };

  router.trigger('willTransition', transition);

  assert.ok(runSharedModelHook.calledTwice, 'handlerInfo.runSharedModelHook is called once per handlerInfo');
  assert.ok(runSharedModelHook.calledWith(transition, 'prefetch'), 'handlerInfo.runSharedModelHook is called with the transition and "prefetch"');
  assert.equal(handler1._prefetched, promise, 'the promise is set on handler1 as _prefetched');
  assert.equal(handler2._prefetched, promise, 'the promise is set on handler2 as _prefetched');
});

test('the prefetch hook is invoked for async handlers', function(assert) {
  assert.expect(4);

  initialize(instance);

  const router = instance.lookup('router:main');
  const promise = Promise.resolve(1);
  const runSharedModelHook = this.stub().returns(promise);
  const handler1 = {};
  const handler2 = {};
  const handlerInfos = [{
    runSharedModelHook,
    handler: handler1,
  }, {
    runSharedModelHook,
    handler: undefined,
    handlerPromise: Promise.resolve(handler2)
  }];
  const transition = { handlerInfos };

  router.trigger('willTransition', transition);

  return wait().then(() => {
    assert.ok(runSharedModelHook.calledTwice, 'handlerInfo.runSharedModelHook is called once per handlerInfo');
    assert.ok(runSharedModelHook.calledWith(transition, 'prefetch'), 'handlerInfo.runSharedModelHook is called with the transition and "prefetch"');
    assert.equal(handler1._prefetched, promise, 'the promise is set on handler1 as _prefetched');
    assert.equal(handler2._prefetched, promise, 'the promise is set on handler2 as _prefetched');
  });
});

test('the prefetch hook is invoked according to route hierarchy for async handlers', function(assert) {
  assert.expect(1);

  initialize(instance);

  const router = instance.lookup('router:main');
  const operations = [];
  const handler1 = {};
  const handler2 = {};
  const handler2Promise = new Promise((resolve) => {
    scheduleMacroTask(() => {
      operations.push('resolved handler 2');
      resolve(handler2);
    });
  });
  const handler1Promise = new Promise((resolve) => {
    scheduleMacroTask(() => {
      operations.push('resolved handler 1');
      resolve(handler1);
    });
  });
  const handlerInfos = [{
    runSharedModelHook() {
      operations.push('prefetch 1');
    },
    handler: undefined,
    handlerPromise: handler1Promise
  }, {
    runSharedModelHook() {
      operations.push('prefetch 2');
    },
    handler: undefined,
    handlerPromise: handler2Promise
  }];
  const transition = { handlerInfos };

  router.trigger('willTransition', transition);

  return new Promise((resolve) => {
    scheduleMacroTask(() => {
      assert.deepEqual(operations, [
        'resolved handler 2',
        'resolved handler 1',
        'prefetch 1',
        'prefetch 2'
      ]);
      resolve();
    });
  });
});
