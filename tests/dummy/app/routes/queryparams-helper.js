import Route from '@ember/routing/route';

export default Route.extend({
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
