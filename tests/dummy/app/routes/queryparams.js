import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    fib: {
      refreshModel: true,
    },
    fiz: {
      refreshModel: true,
    },
  },

  prefetch() {
    window.QueryparamsRoute_prefetch_hasRun = (window.QueryparamsRoute_prefetch_hasRun || 0) + 1;
  },
});
