import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import Route from '@ember/routing/route';

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
});