import Ember from 'ember';
import { module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL } from '@ember/test-helpers';
import test from 'ember-sinon-qunit/test-support/test';

module('Acceptance | abort-transition', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    this.router = this.owner.lookup('router:main');
    window.AbortTransitionToChild_prefetch_count = 0;
    window.AbortTransitionToChild_Child_prefetch_count = 0;
  });

  hooks.afterEach(function() {
    this.router = null;
    delete window.AbortTransitionToChild_prefetch_count;
    delete window.AbortTransitionToChild_Child_prefetch_count;
  });

  test('visiting /abort-transition-to-child/child aborts transition and doesn\'t run additional prefetch hooks', async function(assert) {
    assert.expect(3);

    await visit('/');

    await this.router.transitionTo('abort-transition-to-child.child');

    assert.equal(currentURL(), '/', 'still on index (transition was aborted)');

    assert.equal(window.AbortTransitionToChild_prefetch_count, 1, 'parent prefetch called');
    assert.equal(window.AbortTransitionToChild_Child_prefetch_count, 0, 'child prefetch not called');
  });
});
