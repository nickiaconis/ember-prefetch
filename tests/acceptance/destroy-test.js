import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';

const { run } = Ember;

module('Acceptance | no prefetch during destroy', {
  beforeEach: function() {
    this.application = startApp();
    window.BarRoute_prefetch_hasRun = 0;
  },

  afterEach: function() {
    run(this.application, 'destroy');
    delete window.BarRoute_prefetch_hasRun;
  },
});

test('we don\'t call prefetch when the router has been destroyed', function(assert) {
  assert.expect(1);
  run(() => {
    let router = this.application.__container__.lookup('router:main');
    router.destroy();

    visit('/bar');
  });

  andThen(function() {
    assert.equal(window.BarRoute_prefetch_hasRun, 0, 'bar\'s prefetch hook was not invoked');
  });
});

test('we don\'t call prefetch when the route has been destroyed', function(assert) {
  assert.expect(1);

  visit('/');

  andThen(() => {
    run(() => {
      let route = this.application.__container__.lookup('route:bar');
      route.destroy();
    });

    visit('/bar');
  });

  andThen(function() {
    assert.equal(window.BarRoute_prefetch_hasRun, 0, 'bar\'s prefetch hook was not invoked');
  });
});
