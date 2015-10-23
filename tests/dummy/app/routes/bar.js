import Ember from 'ember';

export default Ember.Route.extend({
  prefetch() {
    window.BarRoute_prefetch_hasRun = true;
  }
});
