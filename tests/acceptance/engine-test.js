import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL } from '@ember/test-helpers';
import Route from '@ember/routing/route';
import Engine from '@ember/engine';
import Controller from '@ember/controller';
import hbs from 'htmlbars-inline-precompile';
import AppRouter from 'dummy/router';
import setupRouterForEngine from '../helpers/setup-router-for-engine';

module('lazy engine loading', function(hooks) {
  setupApplicationTest(hooks);
  setupRouterForEngine(hooks);

  hooks.beforeEach(function(assert) {
    this.owner.register(
      'route:application',
      Route.extend({
        prefetch() {
          assert.step('application');
        },
      })
    );
    this.owner.register('template:application', hbs`{{outlet}}`);
    this.owner.register('controller:application', Controller.extend());
    debugger;
    AppRouter.map(function() {
      this.mount('blog');
    });
    this.owner.register('route-map:blog', function() {
      this.route('post');
    });
    this.owner.register('engine:blog', Engine.extend({
      init() {
        this._super(...arguments);
        this.register('template:application', hbs`{{outlet}}`);
        this.register('controller:application', Controller.extend());

        this.register('template:post', hbs`Post {{this.model}}`);
        this.register('route:application', Route.extend({
          prefetch() {
            assert.step('blog-application');
          }
        }));
        this.register('route:post', Route.extend({
          prefetch() {
            assert.step('blog-post');
          }
        }));
      }
    }))
  });

  test('prefetch hook on lazy engine is called', async function(assert) {
    await visit('/blog/post');
    assert.verifySteps(['application', 'blog-application', 'blog-post']);
    assert.equal(currentURL(), '/blog/post');
  });
});

