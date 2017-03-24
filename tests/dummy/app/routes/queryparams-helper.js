import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    fix: {
      refreshModel: true,
    },
    fuzz: {
      refreshModel: true,
    },
  },

  prefetch() {
    this.replaceWith('queryparams', {
      queryParams: {
        fib: 'fab',
        fiz: 'baz',
      },
    });
  },
});
