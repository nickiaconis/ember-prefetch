import Ember from 'ember';

let hasInitialized = false;
let isOuter = true;
let hasWillTransitioned = false;

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
          const localIsOuter = isOuter;
          isOuter = false;

          const oldInfos = router.state.handlerInfos;
          const transition = oldTransitionByIntent.apply(router, arguments);

          // Router.js does not trigger `willTransition` when redirecting. We need
          // `willTransition` to be triggered regardless so that the `prefetch` hook is
          // always invoked for the routes in the new transition. Internally, the
          // `willTransition` hook uses `Ember.run.once` to fire the event, which
          // gurantees that it will not trigger `willTransition` multiple times.
          if (!hasWillTransitioned && transition) {
            emberRouter.willTransition(oldInfos, transition.state.handlerInfos, transition);
            hasWillTransitioned = true;
          }

          if (localIsOuter) {
            hasWillTransitioned = false;
            isOuter = true;
          }

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
