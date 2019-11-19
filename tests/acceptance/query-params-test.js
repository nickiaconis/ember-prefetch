import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL, currentRouteName, settled } from '@ember/test-helpers';
import Route from '@ember/routing/route';
import Controller from '@ember/controller';
import { gte } from 'ember-compatibility-helpers';

module('Acceptance | query-params', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function(assert) {
    this.owner.register(
      'route:application',
      Route.extend({
        prefetch() {
          assert.step('application');
        },
      })
    );

    this.owner.register(
      'route:parent',
      Route.extend({
        prefetch() {
          assert.step('parent');
        },
      })
    );
    this.owner.register(
      'route:parent.child',
      Route.extend({
        prefetch() {
          assert.step('child');
        },
      })
    );

    this.owner.register(
      'route:queryparams',
      Route.extend({
        queryParams: {
          fib: {
            refreshModel: true,
          },
          fiz: {
            refreshModel: true,
          },
        },
        prefetch() {
          assert.step('queryparams');
        }
      })
    );
    this.owner.register(
      'controller:queryparams',
      Controller.extend({
        queryParams: ['foo', 'fib', 'fiz'],
        foo: null,
        fib: null,
        fiz: null,
      })
    );

    this.owner.register(
      'route:queryparams-helper',
      Route.extend({
        queryParams: {
          fix: {
            refreshModel: true,
          },
          fuzz: {
            refreshModel: true,
          },
        },
        prefetch() {
          this.replaceWith('queryparams', {
            queryParams: {
              fib: 'fab',
              fiz: 'baz',
            },
          });
        },
      })
    );
    this.owner.register(
      'controller:queryparams-helper',
      Controller.extend({
        queryParams: ['fix', 'fuzz'],
        fix: null,
        fuzz: null,
      })
    );

    this.owner.register(
      'route:queryparams-children',
      Route.extend({
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
        },
      })
    );

    this.owner.register(
      'route:queryparams-children.index',
      Route.extend({
        prefetch() {
          assert.step('queryparams-children.index');
        },
      })
    );

    this.owner.register(
      'controller:queryparams-children',
      Controller.extend({
        queryParams: ['fib', 'fiz'],
      })
    );

    this.owner.register(
      'controller:queryparams-children.child',
      Controller.extend({
        queryParams: ['bar'],
      })
    );

    this.owner.register(
      'route:queryparams-children.child',
      Route.extend({
        queryParams: {
          bar: {
            refreshModel: true,
          },
        },
        prefetch() {
          assert.step('queryparams-children.child');
        },
      })
    );

    this.router = this.owner.lookup('router:main');
  });

  test('loading a route with a query param runs the prefetch hook', async function(assert) {
    assert.expect(5);

    await visit('/queryparams?foo=bar');

    const url = currentURL();
    assert.equal(currentRouteName(), 'queryparams', 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?foo=bar', 'the query param is set');
    assert.verifySteps([
      'application',
      'queryparams'
    ]);
  });

  test('loading a route with a query param marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(5);

    await visit('/queryparams?fiz=baz');

    const url = currentURL();
    assert.equal(currentRouteName(), 'queryparams', 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fiz=baz', 'the query param is set');
    assert.verifySteps([
      'application',
      'queryparams'
    ]);
  });

  test('loading a route with multiple query params marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(5);

    await visit('/queryparams?fib=fab&fiz=baz');

    const url = currentURL();
    assert.equal(currentRouteName(), 'queryparams', 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fib=fab&fiz=baz', 'the query params are set');
    assert.verifySteps([
      'application',
      'queryparams'
    ]);
  });

  test('transitioning to a route with a query param runs the prefetch hook', async function(assert) {
    assert.expect(5);

    await visit('/');

    await this.router.transitionTo('queryparams', { queryParams: { foo: 'bar' } });

    const url = currentURL();
    assert.equal(currentRouteName(), 'queryparams', 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?foo=bar', 'the query param is set');
    assert.verifySteps([
      'application',
      'queryparams'
    ]);
  });

  test('transitioning to a route with a query param marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(6);

    await visit('/');

    try {
      await this.router.transitionTo('queryparams', { queryParams: { fiz: 'baz' } });
    } catch (e) {
      assert.equal(e.message, 'TransitionAborted');
    }

    await settled();

    const url = currentURL();
    assert.equal(currentRouteName(), 'queryparams', 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fiz=baz', 'the query param is set');
    assert.verifySteps([
      'application',
      'queryparams'
    ]);
  });

  test('transitioning to a route with multiple query params marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(6);

    await visit('/');

    try {
      await this.router.transitionTo('queryparams', {
        queryParams: {
          fib: 'fab',
          fiz: 'baz',
        },
      });
    } catch (e) {
      assert.equal(e.message, 'TransitionAborted');
    }

    await settled();

    const url = currentURL();
    assert.equal(currentRouteName(), 'queryparams', 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fib=fab&fiz=baz', 'the query params are set');
    assert.verifySteps([
      'application',
      'queryparams'
    ]);
  });

  test('transitioning to a route with multiple query params marked with refreshModel that redirects to a route with multiple query params marked with refreshModel runs the prefetch hook', async function(assert) {
  assert.expect(6);

    await visit('/');

    try {
      await this.router.transitionTo('queryparams-helper', {
        queryParams: {
          fix: 'fax',
          fuzz: 'futz',
        },
      });
    } catch (e) {
      assert.equal(e.message, 'TransitionAborted');
    }

    await settled();

    const url = currentURL();
    assert.equal(currentRouteName(), 'queryparams', 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fib=fab&fiz=baz', 'the query params are set');
    assert.verifySteps([
      'application',
      'queryparams'
    ]);
  });

  test('changing a query param does not run the prefetch hook', async function(assert) {
    assert.expect(6);

    await visit('/queryparams');

    assert.verifySteps([
      'application',
      'queryparams'
    ]);

    await this.router.transitionTo('queryparams', { queryParams: { foo: 'bar' } });

    const url = currentURL();
    assert.equal(currentRouteName(), 'queryparams', 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?foo=bar', 'the query param is set');
    assert.verifySteps([]);
  });

  test('changing a query param does not run the prefetch hook (when other queryParams are set)', async function(assert) {
    assert.expect(6);

    await visit('/queryparams');

    await this.router.transitionTo('queryparams', { queryParams: { fiz: 'biz' } });
    await this.router.transitionTo('queryparams', {
      queryParams: { fiz: 'biz', foo: 'bar' },
    });

    const url = currentURL();
    assert.equal(currentRouteName(), 'queryparams', 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fiz=biz&foo=bar', 'the query params are set');
    assert.verifySteps([
      'application',
      'queryparams',
      'queryparams'
    ], 'the prefetch hook was only run twice');
  });

  test('changing a query param marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(6);

    await visit('/queryparams');

    await this.router.transitionTo('queryparams', {
      queryParams: { fiz: 'baz', foo: null },
    });

    const url = currentURL();
    assert.equal(currentRouteName(), 'queryparams', 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fiz=baz', 'the query param is set');
    assert.verifySteps([
      'application',
      'queryparams',
      'queryparams'
    ], 'prefetch hook run twice');
  });

  test('changing multiple query params marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(6);

    await visit('/queryparams');

    await this.router.transitionTo('queryparams', {
      queryParams: {
        foo: null,
        fib: 'fab',
        fiz: 'baz',
      },
    });

    const url = currentURL();
    assert.equal(currentRouteName(), 'queryparams', 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fib=fab&fiz=baz', 'the query params are set');
    assert.verifySteps([
      'application',
      'queryparams',
      'queryparams'
    ], 'prefetch hook run twice');
  });

  test('removing a query param marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(7);

    await visit('/queryparams');

    await this.router.transitionTo('queryparams', {
      queryParams: { fiz: 'baz', foo: null },
    });
    await this.router.transitionTo('queryparams', {
      queryParams: { fiz: null, foo: null },
    });

    const url = currentURL();
    assert.equal(currentRouteName(), 'queryparams', 'the desired route is reached');
    assert.equal(url.indexOf('?'), -1, 'the query param is set');
    assert.verifySteps([
      'application',
      'queryparams',
      'queryparams',
      'queryparams'
    ], 'prefetch hook run thrice');
  });

  test('hook counts for refresh qps', async function(assert) {
    await visit('/parent/child');

    await this.owner.lookup('service:router').transitionTo('/qp');

    await this.owner
      .lookup('service:router')
      .transitionTo('queryparams-children', { queryParams: { fiz: true } });

    assert.equal(currentURL(), '/qp?fiz=true');

    try {
      await this.owner
        .lookup('service:router')
        .transitionTo('queryparams-children.child', { queryParams: { bar: true } });
    } catch (e) {
      assert.equal(e.name, 'TransitionAborted');
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
        'child',
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
        'child',
      ]);
    }
  });

  test('hook counts for non-refreshable qps', async function(assert) {
    this.owner.register(
      'route:queryparams-children',
      Route.extend({
        prefetch() {
          assert.step('queryparams-children');
        },
      })
    );
    await visit('/parent/child');

    await this.owner.lookup('service:router').transitionTo('/qp');

    await this.owner
      .lookup('service:router')
      .transitionTo('queryparams-children', { queryParams: { fiz: true } });

    assert.equal(currentURL(), '/qp?fiz=true');

    try {
      await this.owner
        .lookup('service:router')
        .transitionTo('queryparams-children.child', { queryParams: { bar: true } });
    } catch (e) {
      assert.equal(e.name, 'TransitionAborted');
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
      'child',
    ]);
  });
});
