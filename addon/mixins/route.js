import Mixin from '@ember/object/mixin';
import RSVP from 'rsvp';
import { getOwner } from '@ember/application';
const PREFETCH_NOT_DEFINED = {};

/**
 * An implementation detail of testing the prefetch initializer.
 *
 * @mixin RouteMixin
 */
export default Mixin.create({
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
          postAuthor: this.prefetched(),
          comments: this.store.findAll('comment')
        });
      }
    });
    ```

    @method prefetched
    @param {String} [name] - The name of the route. Defaults to the current route if no name is given.
    @return {Promise} A promise that resolves with the prefetched data.
    @public
  */
  prefetched(name) {
    if (arguments.length < 1) {
      name = this.routeName;
    }
    const container = getOwner ? getOwner(this) : this.container;
    const route = container.lookup(`route:${name}`);
    return RSVP.Promise.resolve(route && route._prefetched);
  },

  prefetch() {
    return PREFETCH_NOT_DEFINED;
  },

  model() {
    const prefetched = this._prefetched;
    const _super = this._super;

    if (!prefetched) {
      return _super.call(this, ...arguments);
    }

    return prefetched.then((value) => {
      // If a prefetch hook is not defined, the default model hook is used.
      if (value === PREFETCH_NOT_DEFINED) {
        return _super.call(this, ...arguments);
      }

      return value;
    });
  },
});
