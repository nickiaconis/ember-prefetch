import Route from '@ember/routing/route';

export default Route.extend({
  prefetch() {
    window.AbortTransitionToChild_Child_prefetch_count++;
  },
});
