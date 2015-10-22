import Ember from 'ember';

let hasInitialized = false;

function abortBeforeTransitioning() {
  const activeTransition = this.router.router.activeTransition;

  if (activeTransition != null) {
    activeTransition.abort();
  }

  return this._super(...arguments);
}

export function initialize() {
  if (!hasInitialized) {
    hasInitialized = true;

    Ember.Router.reopen({
      transitionTo: abortBeforeTransitioning,
    });
  }
}

export default {
  name: 'abort-early-patch',
  initialize: initialize
};
