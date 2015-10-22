import Ember from 'ember';
import RouteMixin from 'ember-prefetch/mixins/route';
import { module } from 'qunit';
import test from 'dummy/tests/ember-sinon-qunit/test';

module('Unit | Mixin | route');

function classFromSpy(spy) {
  return Ember.Object.extend({
    model: spy,
  }, RouteMixin);
}

test('the model hook doesn\'t die when route.prefetched is undefined', function(assert) {
  assert.expect(1);

  const _super = this.spy();
  const route = classFromSpy(_super).create();
  route.model();

  assert.ok(_super.calledOnce, '_super is called');
});

test('the model hook returns route.prefetched if _prefetchReturnedUndefined is false', function(assert) {
  assert.expect(2);

  const data = { _prefetchReturnedUndefined: false };
  const _super = this.spy();
  const route = classFromSpy(_super).create({ prefetched: data });

  assert.equal(route.model(), data, 'the model hook returns route.prefetched');
  assert.notOk(_super.called, '_super is not called');
});

test('the model hook calls super if _prefetchReturnedUndefined is true', function(assert) {
  assert.expect(2);

  const data = { _prefetchReturnedUndefined: true };
  const _super = this.spy();
  const route = classFromSpy(_super).create({ prefetched: data });

  assert.notEqual(route.model(), data, 'the model hook does not return route.prefetched');
  assert.ok(_super.calledOnce, '_super is called');
});
