import Route from '@ember/routing/route';

export default Route.extend({
  prefetch() {
    window.BarRoute_prefetch_hasRun = (window.BarRoute_prefetch_hasRun || 0) + 1;
  },
});
