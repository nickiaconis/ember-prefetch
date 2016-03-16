import Ember from 'ember';
import { initialize } from '../../../instance-initializers/prefetch';
import RouteMixin from 'ember-prefetch/mixins/route';
import { module } from 'qunit';
import test from 'dummy/tests/ember-sinon-qunit/test';

const { Promise } = Ember.RSVP;
let application, instance;

module('Unit | Mixin | route', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      instance = application.buildInstance();
      initialize(instance);
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

function classFromObject(obj) {
  return Ember.Object.extend(obj, RouteMixin);
}

function classFromSpy(spy) {
  return classFromObject({
    model: spy,
  });
}

function registerRoute(name, obj) {
  obj.routeName = obj.routeName || name;
  const longName = `route:${name}`;
  instance.register(longName, classFromObject(obj));
  return instance.lookup(longName);
}

test('the case when route._prefetched is undefined is accounted for', function(assert) {
  assert.expect(1);

  const _super = this.spy();
  const route = classFromSpy(_super).create();
  try {
    route.model();
  } catch(e) {
    assert.ok(false, 'the model hook doesn\'t die with route._prefetched is undefined');
  }

  assert.ok(_super.calledOnce, 'the super class\'s model hook is called');
});

test('the prefetched method returns the promise for the specified route', function(assert) {
  assert.expect(2);

  const parentData = {};
  registerRoute('parent', { _prefetched: parentData });

  const selfData = {};
  const selfRoute = registerRoute('self', { _prefetched: selfData });

  assert.equal(selfRoute.prefetched('parent')._result, parentData, 'prefetched returns the promise of the named route');
  assert.equal(selfRoute.prefetched()._result, selfData, 'prefetched returns the promise of the calling route when no name is given');
});

function modelHookTestingHelper(hook) {
  const router = instance.lookup('router:main');

  // simulate prefetch being defined
  const obj = {};
  const spy = this.stub().returns(obj);
  const Route = classFromSpy(spy);
  const route = typeof hook === 'function' ? Route.create({ prefetch: hook }) : Route.create();
  const handlerInfoWithPrefetch = {
    runSharedModelHook(_, hookName) {
      if (hookName === 'prefetch') {
        return Promise.resolve(this.handler.prefetch());
      }
    },
    handler: route,
  };
  const transitionWithPrefetch = { handlerInfos: [handlerInfoWithPrefetch] };

  router.trigger('willTransition', transitionWithPrefetch);

  return {
    route,
    spy,
    model: obj,
  };
}

test('the model hook returns the result of prefetch if a prefetch hook is defined', function(assert) {
  assert.expect(3);

  const data = {};
  function prefetch() {
    return data;
  }
  const { model, route, spy: _super } = modelHookTestingHelper.call(this, prefetch);

  return route.model().then((result) => {
    assert.equal(result, data, 'the model hook returns a promise that resolves with the result of the prefetch hook');
    assert.notEqual(result, model, 'the promise is not resolved the with result of the super class\'s model hook');
    assert.notOk(_super.called, 'the super class\'s model hook is not called');
  });
});

test('the model hook calls super if no prefetch hook is defined', function(assert) {
  assert.expect(2);

  const { model, route, spy: _super } = modelHookTestingHelper.call(this);

  return route.model().then((result) => {
    assert.equal(result, model, 'the model hook returns a promise that resolves with the result of the super class\'s model hook');
    assert.ok(_super.called, 'the super class\'s model hook is called');
  });
});
