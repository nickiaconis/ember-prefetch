import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL } from '@ember/test-helpers';

module('Acceptance | redirect', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    window.BarRoute_prefetch_hasRun = 0;
  });

  hooks.afterEach(function() {
    delete window.BarRoute_prefetch_hasRun;
  });

  test('visiting /foo redirects to /bar and calls bar\'s prefetch hook', async function(assert) {
    assert.expect(2);

    await visit('/foo');

    assert.equal(currentURL(), '/bar', '/foo redirected to /bar');
    assert.equal(window.BarRoute_prefetch_hasRun, 1, 'bar\'s prefetch hook was invoked');
  });
});
