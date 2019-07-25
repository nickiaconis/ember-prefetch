import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import Route from '@ember/routing/route';

module('Route hooks', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function(assert) {
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
      'parent',
      'child',
      'sibling'
    ]);
  });
});