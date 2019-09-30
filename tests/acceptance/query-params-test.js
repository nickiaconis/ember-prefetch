import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL, currentRouteName, settled } from '@ember/test-helpers';

const QUERYPARAMS_HELPER_ROUTE_NAME = 'queryparams-helper';
const QUERYPARAMS_ROUTE_NAME = 'queryparams';
const QUERYPARAMS_ROUTE_URL = '/queryparams';

module('Acceptance | query-params', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    this.router = this.owner.lookup('router:main');
    window.QueryparamsRoute_prefetch_hasRun = 0;
  });

  hooks.afterEach(function() {
    delete window.QueryparamsRoute_prefetch_hasRun;
  });

  test('loading a route with a query param runs the prefetch hook', async function(assert) {
    assert.expect(3);

    await visit(`${QUERYPARAMS_ROUTE_URL}?foo=bar`);

    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?foo=bar', 'the query param is set');
    assert.equal(
      window.QueryparamsRoute_prefetch_hasRun,
      1,
      "queryparams' prefetch hook was invoked"
    );
  });

  test('loading a route with a query param marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(3);

    await visit(`${QUERYPARAMS_ROUTE_URL}?fiz=baz`);

    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fiz=baz', 'the query param is set');
    assert.equal(
      window.QueryparamsRoute_prefetch_hasRun,
      1,
      "queryparams' prefetch hook was invoked"
    );
  });

  test('loading a route with multiple query params marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(3);

    await visit(`${QUERYPARAMS_ROUTE_URL}?fib=fab&fiz=baz`);

    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fib=fab&fiz=baz', 'the query params are set');
    assert.equal(
      window.QueryparamsRoute_prefetch_hasRun,
      1,
      "queryparams' prefetch hook was invoked"
    );
  });

  test('transitioning to a route with a query param runs the prefetch hook', async function(assert) {
    assert.expect(3);

    await visit('/');

    await this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, { queryParams: { foo: 'bar' } });

    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?foo=bar', 'the query param is set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'the prefetch hook was run');
  });

  test('transitioning to a route with a query param marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(4);

    await visit('/');

    try {
      await this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, { queryParams: { fiz: 'baz' } });
    } catch (e) {
      assert.equal(e.message, 'TransitionAborted');
    }

    await settled();

    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fiz=baz', 'the query param is set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'the prefetch hook was run');
  });

  test('transitioning to a route with multiple query params marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(4);

    await visit('/');

    try {
      await this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, {
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
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fib=fab&fiz=baz', 'the query params are set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'the prefetch hook was run');
  });

  test('transitioning to a route with multiple query params marked with refreshModel that redirects to a route with multiple query params marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(4);

    await visit('/');

    try {
      await this.router.transitionTo(QUERYPARAMS_HELPER_ROUTE_NAME, {
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
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fib=fab&fiz=baz', 'the query params are set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'the prefetch hook was run');
  });

  test('changing a query param does not run the prefetch hook', async function(assert) {
    assert.expect(4);

    await visit(`${QUERYPARAMS_ROUTE_URL}`);

    assert.equal(
      window.QueryparamsRoute_prefetch_hasRun,
      1,
      'the prefetch hook was run for the initial transition'
    );

    await this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, { queryParams: { foo: 'bar' } });

    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?foo=bar', 'the query param is set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'the prefetch hook was not run again');
  });

  test('changing a query param does not run the prefetch hook (when other queryParams are set)', async function(assert) {
    assert.expect(4);

    await visit(`${QUERYPARAMS_ROUTE_URL}`);

    assert.equal(
      window.QueryparamsRoute_prefetch_hasRun,
      1,
      'the prefetch hook was run for the initial transition'
    );

    await this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, { queryParams: { fiz: 'biz' } });
    await this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, {
      queryParams: { fiz: 'biz', foo: 'bar' },
    });

    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fiz=biz&foo=bar', 'the query params are set');
    assert.equal(
      window.QueryparamsRoute_prefetch_hasRun,
      2,
      'the prefetch hook was only run twice'
    );
  });

  test('changing a query param marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(4);

    await visit(`${QUERYPARAMS_ROUTE_URL}`);

    assert.equal(
      window.QueryparamsRoute_prefetch_hasRun,
      1,
      'the prefetch hook was run for the initial transition'
    );

    await this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, {
      queryParams: { fiz: 'baz', foo: null },
    });

    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fiz=baz', 'the query param is set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 2, 'the prefetch hook was run again');
  });

  test('changing multiple query params marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(4);

    await visit(`${QUERYPARAMS_ROUTE_URL}`);

    assert.equal(
      window.QueryparamsRoute_prefetch_hasRun,
      1,
      'the prefetch hook was run for the initial transition'
    );

    await this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, {
      queryParams: {
        foo: null,
        fib: 'fab',
        fiz: 'baz',
      },
    });

    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fib=fab&fiz=baz', 'the query params are set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 2, 'the prefetch hook was run again');
  });

  test('removing a query param marked with refreshModel runs the prefetch hook', async function(assert) {
    assert.expect(4);

    await visit(`${QUERYPARAMS_ROUTE_URL}`);

    assert.equal(
      window.QueryparamsRoute_prefetch_hasRun,
      1,
      'the prefetch hook was run for the initial transition'
    );

    await this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, {
      queryParams: { fiz: 'baz', foo: null },
    });
    await this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, {
      queryParams: { fiz: null, foo: null },
    });

    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.indexOf('?'), -1, 'the query param is set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 3, 'the prefetch hook was run again');
  });
});
