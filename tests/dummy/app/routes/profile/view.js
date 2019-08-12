import Route from '@ember/routing/route';

export default Route.extend({
  prefetch(_, transition) {
    return transition.to.parent.params.id;
  },
});
