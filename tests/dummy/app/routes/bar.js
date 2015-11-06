import Ember from 'ember';

export default Ember.Route.extend({
  prefetch() {
    window.BarRoute_prefetch_hasRun = (window.BarRoute_prefetch_hasRun || 0) + 1;
  },
});
