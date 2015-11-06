import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';

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

test('visiting a route with query params does not break the prefetch hook', function(assert) {
  assert.expect(5);

  visit('/queryparams');

  andThen(() => {
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'queryparams\' prefetch hook was invoked for the initial transition');

    this.router.transitionTo('queryparams', { queryParams: { foo: 'bar' } });
  });

  andThen(() => {
    assert.equal(currentURL(), '/queryparams?foo=bar', 'the URL contains the query params');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 1, 'queryparams\' prefetch hook was not invoked again');

    this.router.transitionTo('queryparams', { queryParams: { fiz: 'baz', foo: null } });
  });

  andThen(() => {
    assert.equal(currentURL(), '/queryparams?fiz=baz', 'the URL contains the new query params');
    assert.equal(window.QueryparamsRoute_prefetch_hasRun, 2, 'queryparams\' prefetch hook was invoked again because fiz is marked with refreshModel');
  });
});
