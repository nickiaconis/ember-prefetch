import Ember from 'ember';

export default Ember.Route.extend({
  prefetch(params, transition) {
    transition.abort();
    window.AbortTransitionToChild_prefetch_count++;
  },
});
