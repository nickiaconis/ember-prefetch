import Ember from 'ember';
import RouteMixin from 'ember-prefetch/mixins/route';
import { module } from 'qunit';
import test from 'dummy/tests/ember-sinon-qunit/test';

var application, instance;

module('Unit | Mixin | route', {
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

test('the model hook doesn\'t die when route._prefetched is undefined', function(assert) {
  assert.expect(1);

  const _super = this.spy();
  const route = classFromSpy(_super).create();
  route.model();

  assert.ok(_super.calledOnce, '_super is called');
});

test('the model hook returns route._prefetched if _prefetchReturnedUndefined is false', function(assert) {
  assert.expect(2);

  const data = { _prefetchReturnedUndefined: false };
  const _super = this.spy();
  const route = classFromSpy(_super).create({ _prefetched: data });

  assert.equal(route.model(), data, 'the model hook returns route.prefetched');
  assert.notOk(_super.called, '_super is not called');
});

test('the model hook calls super if _prefetchReturnedUndefined is true', function(assert) {
  assert.expect(2);

  const data = { _prefetchReturnedUndefined: true };
  const _super = this.spy();
  const route = classFromSpy(_super).create({ _prefetched: data });

  assert.notEqual(route.model(), data, 'the model hook does not return route._prefetched');
  assert.ok(_super.calledOnce, '_super is called');
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
