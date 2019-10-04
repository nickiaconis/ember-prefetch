import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, click } from '@ember/test-helpers';

module('Acceptance | refresh', function(hooks) {
  setupApplicationTest(hooks);

  test("Child route.refresh should reflect parent model's refreshed values", async function(assert) {
    assert.expect(4);

    await visit('/refresh-parent');

    await click('.link-to-child');

    assert.equal(
      document.getElementById('parent-value').textContent,
      'original',
      'parent value should be original'
    );
    assert.equal(
      document.getElementById('child-value').textContent,
      'original',
      'child value should be original'
    );

    await click('#modify-button');
    assert.equal(
      document.getElementById('parent-value').textContent,
      'modified',
      'parent value should be modified'
    );
    assert.equal(
      document.getElementById('child-value').textContent,
      'modified',
      'child value should be modified'
    );
  });

  test('route.refresh should invoke prefetched to reflect current value', async function(assert) {
    assert.expect(3);

    await visit('/refresh-parent');

    await click('.link-to-child');

    assert.equal(
      document.getElementById('counter-value').textContent,
      '0',
      'Current counter should be 0'
    );

    await click('#refresh-current-button');
    assert.equal(
      document.getElementById('counter-value').textContent,
      '1',
      'Current counter should be 1'
    );

    await click('#refresh-current-button');
    assert.equal(
      document.getElementById('counter-value').textContent,
      '2',
      'Current counter should be 2'
    );
  });
});
