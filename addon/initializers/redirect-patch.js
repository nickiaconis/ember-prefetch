import Ember from 'ember';

let hasInitialized = false;

function triggerAfterTransitioning() {
  const oldInfos = this.router.state.handlerInfos;
  const transition = this._super(...arguments);

  // Router.js does not trigger `willTransition` when redirecting. We need
  // `willTransition` to be triggered regardless so that the `prefetch` hook is
  // always invoked for the routes in the new transition. Internally, the
  // `willTransition` hook uses `Ember.run.once` to fire the event, which
  // gurantees that it will not trigger `willTransition` multiple times.
  this.willTransition(oldInfos, transition.state.handlerInfos, transition);

  return transition;
}

export function initialize() {
  if (!hasInitialized) {
    hasInitialized = true;

    Ember.Router.reopen({
      transitionTo: triggerAfterTransitioning,
    });
  }
}

export default {
  name: 'redirect-patch',
  initialize: initialize
};
