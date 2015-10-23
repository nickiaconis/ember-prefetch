import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';

module('Acceptance | redirect', {
  beforeEach: function() {
    this.application = startApp();
    window.BarRoute_prefetch_hasRun = false;
  },

  afterEach: function() {
    Ember.run(this.application, 'destroy');
    delete window.BarRoute_prefetch_hasRun;
  }
});

test('visiting /foo redirects to /bar and calls bar\'s prefetch hook', function(assert) {
  assert.expect(2);

  visit('/foo');

  andThen(function() {
    assert.equal(currentURL(), '/bar', '/foo redirected to /bar');
    assert.ok(window.BarRoute_prefetch_hasRun, 'bar\'s prefetch hook was invoked');
  });
});
