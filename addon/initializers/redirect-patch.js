import Ember from 'ember';

let hasInitialized = false;

function triggerAfterTransitioning() {
  const transition = this._super(...arguments);

  // Router.js does not trigger `willTransition` when redirecting. We need
  // `willTransition` to be triggered regardless so that the `prefetch` hook is
  // always invoked for the routes in the new transition. Using
  // `Ember.run.once` gurantees that we will not trigger `willTransition`
  // multiple times.
  Ember.run.once(this, this.trigger, 'willTransition', transition);

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
