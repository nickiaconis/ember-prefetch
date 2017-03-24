import Ember from 'ember';

let hasInitialized = false;
const stack = [];
let latest = null;

export function initialize() {
  if (!hasInitialized) {
    hasInitialized = true;

    Ember.Router.reopen({
      _initRouterJs() {
        this._super.apply(this, arguments);

        // now this.router is available
        const router = this.router;
        const emberRouter = this;

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
          if (stack.length === 1) {
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

export default {
  name: 'redirect-patch',
  initialize: initialize
};
