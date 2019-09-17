import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | lazy engine', function(hooks) {
  setupApplicationTest(hooks);

  test('it can load an async route from a lazy loaded engine', async function(assert) {
    await visit('/lazy-engine/my-route');

    assert.dom('#test-my-route-model').hasText('test prefetch hook');
    assert.equal(currentURL(), '/lazy-engine/my-route');
  });
});
