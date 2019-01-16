import Route from '@ember/routing/route';

export default Route.extend({
  prefetch(params, transition) {
    transition.abort();
    window.AbortTransitionToChild_prefetch_count++;
  },
});
