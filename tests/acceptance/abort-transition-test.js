import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';

const { run } = Ember;

module('Acceptance | abort-transition', {
  beforeEach() {
    this.application = startApp();
    this.router = this.application.__container__.lookup('router:main');
    window.AbortTransitionToChild_prefetch_count = 0;
    window.AbortTransitionToChild_Child_prefetch_count = 0;
  },

  afterEach() {
    this.router = null;
    run(this.application, 'destroy');
    delete window.AbortTransitionToChild_prefetch_count;
    delete window.AbortTransitionToChild_Child_prefetch_count;
  },
});

test('visiting /abort-transition-to-child/child aborts transition and doesn\'t run additional prefetch hooks', function(assert) {
  assert.expect(3);

  visit('/');

  andThen(() => {
    this.router.transitionTo('abort-transition-to-child.child');
  });

  andThen(() => {
    assert.equal(currentURL(), '/', 'still on index (transition was aborted)');

    assert.equal(window.AbortTransitionToChild_prefetch_count, 1, 'parent prefetch called');
    assert.equal(window.AbortTransitionToChild_Child_prefetch_count, 0, 'child prefetch not called');
  });
});
