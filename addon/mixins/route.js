import Ember from 'ember';

/**
 * An implementation detail of testing the prefetch initializer.
 *
 * @mixin RouteMixin
 */
export default Ember.Mixin.create({
  /**
    Returns a promise that resolves the prefetched data of a parent
    (or any ancestor) route in a route hierarchy.  During a transition,
    all routes have the opportunity to prefetch data, and if a route needs
    access to a parent route's prefetched data, it can call
    `this.prefetched(theNameOfParentRoute)` to retrieve a promise that
    resolves with it.

    Example

    ```javascript
    App.Router.map(function() {
      this.route('post', { path: '/post/:post_id' }, function() {
        this.route('comments', { resetNamespace: true });
      });
    });

    App.CommentsRoute = Ember.Route.extend({
      async prefetch(params) {
        return this.store.findRecord('user', (await this.prefetched('post')).author.id);
      },

      model(params) {
        return Ember.RSVP.hash({
          postAuthor: this.prefetched(this.routeName),
          comments: this.store.findAll('comment')
        });
      }
    });
    ```

    @method prefetched
    @param {String} name the name of the route
    @return {Promise} a promise that resolves with the prefetched data
    @public
  */
  // prefetched(name) {
  //   var route = this.container.lookup(`route:${name}`);
  //   return Ember.RSVP.Promise.resolve(route && route.asyncData);
  // },


  model(params, transition) {
    const prefetched = this.prefetched;

    if (prefetched && !prefetched._prefetchReturnedUndefined) {
      return prefetched;
    }

    return this._super(params, transition);
  },
});
