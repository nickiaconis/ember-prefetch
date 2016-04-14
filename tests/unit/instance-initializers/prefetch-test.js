import Ember from 'ember';
import { initialize } from '../../../instance-initializers/prefetch';
import { module } from 'qunit';
import test from 'dummy/tests/ember-sinon-qunit/test';

let application, instance;

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
  const promise = new Ember.RSVP.resolve(1);
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
