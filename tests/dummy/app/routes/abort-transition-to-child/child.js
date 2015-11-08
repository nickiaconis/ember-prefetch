import Ember from 'ember';

export default Ember.Route.extend({
  prefetch() {
    window.AbortTransitionToChild_Child_prefetch_count++;
  },
});
