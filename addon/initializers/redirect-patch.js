import EmberRouter from '@ember/routing/router';
import { lte } from 'ember-compatibility-helpers';

let hasInitialized = false;

export function initialize() {
  if (lte('3.5.1')) {
    if (!hasInitialized) {
      hasInitialized = true;

      EmberRouter.reopen({
        _initRouterJs() {
          this._super.apply(this, arguments);

          // now this.router is available
          // router.router renamed to _routerMicrolib in 2.13
          // https://emberjs.com/deprecations/v2.x/#toc_ember-router-router-renamed-to-ember-router-_routermicrolib
          const router = this._routerMicrolib || this.router;
          const emberRouter = this;
          const stack = [];
          let latest = null;

          // replace router's transitionByIntent method, through which all transitions pass
          const oldTransitionByIntent = router.transitionByIntent;
          router.transitionByIntent = function() {
            stack.push(1);

            const oldInfos = router.state.handlerInfos;
            const transition = oldTransitionByIntent.apply(router, arguments);

            if (!latest || stack.length >= latest.stackSize) {
              latest = {
                oldInfos,
                transition,
              };
            }

            latest.stackSize = stack.length;

            // Router.js does not trigger `willTransition` when redirecting. We need
            // `willTransition` to be triggered regardless so that the `prefetch` hook is
            // always invoked for the routes in the new transition. Internally, the
            // `willTransition` hook uses `Ember.run.once` to fire the event, which
            // gurantees that it will not trigger `willTransition` multiple times.
            if (stack.length === 1 && transition) {
              emberRouter.willTransition(latest.oldInfos, transition.state.handlerInfos, latest.transition);
              latest = null;
            }

            stack.pop();

            return transition;
          };
        },
      });
    }
  }
}

export default {
  name: 'redirect-patch',
  initialize: initialize
};
