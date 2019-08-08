import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL } from '@ember/test-helpers';
import Route from '@ember/routing/route';
import Controller from '@ember/controller';
import { gte } from 'ember-compatibility-helpers';

module('Route hooks', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function(assert) {
    this.owner.register('route:application', Route.extend({
      prefetch() {
        assert.step('application');
      }
    }));

    this.owner.register('route:foo', Route.extend({
      prefetch() {
        assert.step('foo');
      }
    }));

    this.owner.register('route:parent', Route.extend({
      prefetch() {
        assert.step('parent');
      }
    }));

    this.owner.register('route:parent.child', Route.extend({
      prefetch() {
        assert.step('child');
      }
    }));

    this.owner.register('route:queryparams-children', Route.extend({
      queryParams: {
        fib: {
          refreshModel: true,
        },
        fiz: {
          refreshModel: true,
        },
      },
      prefetch() {
        assert.step('queryparams-children');
      }
    }));

    this.owner.register('route:queryparams-children.index', Route.extend({
      prefetch() {
        assert.step('queryparams-children.index');
      }
    }));

    this.owner.register('controller:queryparams-children', Controller.extend({
      queryParams: [
        'fib',
        'fiz',
      ],
    }));

    this.owner.register('controller:queryparams-children.child', Controller.extend({
      queryParams: [
        'bar',
      ],
    }));

    this.owner.register('route:queryparams-children.child', Route.extend({
      queryParams: {
        bar: {
          refreshModel: true,
        }
      },
      prefetch() {
        assert.step('queryparams-children.child');
      }
    }));

    this.owner.register('route:parent.sibling', Route.extend({
      prefetch() {
        assert.step('sibling');
      }
    }));
  });

  test('hook counts', async function(assert) {

    await visit('/parent/child');

    await this.owner.lookup('service:router').transitionTo('/parent/sibling');

    assert.verifySteps([
      'application',
      'parent',
      'child',
      'sibling'
    ]);
  });

  test('hook counts for child routes', async function(assert) {
    await visit('/parent/child');

    await this.owner.lookup('service:router').transitionTo('/parent/sibling');

    await this.owner.lookup('service:router').transitionTo('/foo');

    await this.owner.lookup('service:router').transitionTo('/parent/child');

    await this.owner.lookup('service:router').transitionTo('/parent/sibling');

    assert.verifySteps([
      'application',
      'parent',
      'child',
      'sibling',
      'foo',
      'parent',
      'child',
      'sibling'
    ]);
  });

  test('hook counts for refresh qps', async function(assert) {
    await visit('/parent/child');

    await this.owner.lookup('service:router').transitionTo('/qp');


    await this.owner.lookup('service:router').transitionTo('queryparams-children', { queryParams: { fiz: true } });

    assert.equal(currentURL(), '/qp?fiz=true');

    try {
      await this.owner.lookup('service:router').transitionTo('queryparams-children.child', { queryParams: { bar: true } });
    } catch (e) {
      assert.equal(e.name, 'TransitionAborted')
    }

    await this.owner.lookup('service:router').transitionTo('/parent/child');

    if (gte('3.6.0')) {
      assert.verifySteps([
        'application',
        'parent',
        'child',
        'queryparams-children',
        'queryparams-children.index',
        'queryparams-children',
        'queryparams-children.child',
        'parent',
        'child'
      ]);
    } else {
      assert.verifySteps([
        'application',
        'parent',
        'child',
        'queryparams-children',
        'queryparams-children.index',
        'queryparams-children',
        'queryparams-children.index',
        'queryparams-children.child',
        'parent',
        'child'
      ]);
    }
  });

  test('hook counts for non-refreshable qps', async function(assert) {
    this.owner.register('route:queryparams-children', Route.extend({
      prefetch() {
        assert.step('queryparams-children');
      }
    }));
    await visit('/parent/child');

    await this.owner.lookup('service:router').transitionTo('/qp');


    await this.owner.lookup('service:router').transitionTo('queryparams-children', { queryParams: { fiz: true } });

    assert.equal(currentURL(), '/qp?fiz=true');

    try {
      await this.owner.lookup('service:router').transitionTo('queryparams-children.child', { queryParams: { bar: true } });
    } catch (e) {
      assert.equal(e.name, 'TransitionAborted')
    }

    await this.owner.lookup('service:router').transitionTo('/parent/child');

    assert.verifySteps([
      'application',
      'parent',
      'child',
      'queryparams-children',
      'queryparams-children.index',
      'queryparams-children.child',
      'parent',
      'child'
    ]);
  });

  test('hook counts param change', async function(assert) {
    this.owner.register('route:profile', Route.extend({
      prefetch({ id }) {
        assert.step(`profile-${id}`);
        return id;
      }
    }));
    await visit('/profile/1');

    assert.equal(document.getElementById('heading').textContent, '1');

    await this.owner.lookup('service:router').transitionTo('/profile/2');

    assert.equal(document.getElementById('heading').textContent, '2');

    assert.verifySteps([
      'application',
      'profile-1',
      'profile-2'
    ]);
  });
});