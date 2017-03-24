import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';

const QUERYPARAMS_ROUTE_NAME = 'queryparams';
const QUERYPARAMS_ROUTE_URL = '/queryparams';

module('Acceptance | query-params', {
  beforeEach: function() {
    this.application = startApp();
    this.router = this.application.__container__.lookup('router:main');
    window.QueryparamsRoute_prefetch_hasRun = 0;
  },

  afterEach: function() {
    Ember.run(this.application, 'destroy');
    delete window.QueryparamsRoute_prefetch_hasRun;
  },
});

test('loading a route with a query param runs the prefetch hook', function(assert) {
  assert.expect(3);

  visit(`${QUERYPARAMS_ROUTE_URL}?foo=bar`);

  andThen(() => {
    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?foo=bar', 'the query param is set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'queryparams\' prefetch hook was invoked');
  });
});

test('loading a route with a query param marked with refreshModel runs the prefetch hook', function(assert) {
  assert.expect(3);

  visit(`${QUERYPARAMS_ROUTE_URL}?fiz=baz`);

  andThen(() => {
    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fiz=baz', 'the query param is set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'queryparams\' prefetch hook was invoked');
  });
});

test('loading a route with multiple query params marked with refreshModel runs the prefetch hook', function(assert) {
  assert.expect(3);

  visit(`${QUERYPARAMS_ROUTE_URL}?fib=fab&fiz=baz`);

  andThen(() => {
    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fib=fab&fiz=baz', 'the query params are set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'queryparams\' prefetch hook was invoked');
  });
});

test('transitioning to a route with a query param runs the prefetch hook', function(assert) {
  assert.expect(3);

  visit('/');

  andThen(() => {
    this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, { queryParams: { foo: 'bar' } });
  });

  andThen(() => {
    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?foo=bar', 'the query param is set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'the prefetch hook was run');
  });
});

test('transitioning to a route with a query param marked with refreshModel runs the prefetch hook', function(assert) {
  assert.expect(3);

  visit('/');

  andThen(() => {
    this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, { queryParams: { fiz: 'baz' } });
  });

  andThen(() => {
    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fiz=baz', 'the query param is set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'the prefetch hook was run');
  });
});

test('transitioning to a route with multiple query params marked with refreshModel runs the prefetch hook', function(assert) {
  assert.expect(3);

  visit('/');

  andThen(() => {
    this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, {
      queryParams: {
        fib: 'fab',
        fiz: 'baz',
      },
    });
  });

  andThen(() => {
    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fib=fab&fiz=baz', 'the query params are set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'the prefetch hook was run');
  });
});

test('changing a query param does not run the prefetch hook', function(assert) {
  assert.expect(4);

  visit(`${QUERYPARAMS_ROUTE_URL}`);

  andThen(() => {
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'the prefetch hook was run for the initial transition');

    this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, { queryParams: { foo: 'bar' } });
  });

  andThen(() => {
    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?foo=bar', 'the query param is set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'the prefetch hook was not run again');
  });
});

test('changing a query param marked with refreshModel runs the prefetch hook', function(assert) {
  assert.expect(4);

  visit(`${QUERYPARAMS_ROUTE_URL}`);

  andThen(() => {
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'the prefetch hook was run for the initial transition');

    this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, { queryParams: { fiz: 'baz', foo: null } });
  });

  andThen(() => {
    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fiz=baz', 'the query param is set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 2, 'the prefetch hook was run again');
  });
});

test('changing multiple query params marked with refreshModel runs the prefetch hook', function(assert) {
  assert.expect(4);

  visit(`${QUERYPARAMS_ROUTE_URL}`);

  andThen(() => {
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'the prefetch hook was run for the initial transition');

    this.router.transitionTo(QUERYPARAMS_ROUTE_NAME, {
      queryParams: {
        foo: null,
        fib: 'fab',
        fiz: 'baz',
      },
    });
  });

  andThen(() => {
    const url = currentURL();
    assert.equal(currentRouteName(), QUERYPARAMS_ROUTE_NAME, 'the desired route is reached');
    assert.equal(url.substring(url.indexOf('?')), '?fib=fab&fiz=baz', 'the query params are set');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 2, 'the prefetch hook was run again');
  });
});
