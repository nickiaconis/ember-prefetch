import Service, { inject as service } from '@ember/service';
import { schedule } from '@ember/runloop';
import { createPrefetchChangeSet } from '../-private/diff-route-info';
import RSVP from 'rsvp';
import { gte } from 'ember-compatibility-helpers';
import { isThenable } from '../-private/utils/is-thenable';

let PrefetchService;

if (gte('3.6.0')) {
  // remove guard for Ember 3.8 LTS and rev major
  PrefetchService = Service.extend({
    router: service('router'),
    init() {
      this._super(...arguments);
      let privateRouter = this.router._router._routerMicrolib;
      let seenRoutes = new WeakMap();

      this.router.on('routeWillChange', transition => {
        if (transition.to && /(^|_|\.)(loading$|error$)/.test(transition.to.name)) {
          return;
        }

        schedule('actions', () => {
          if (!this.isDestroying && !this.isDestroyed) {
            let changeSet = createPrefetchChangeSet(privateRouter, transition);
            if (changeSet.shouldCall) {
              for (let i = 0; i < changeSet.for.length; i++) {
                let { route, fullParams } = changeSet.for[i];
                if (seenRoutes.has(route)) continue;

                if (isThenable(route)) {
                  // Ensure we use the expected fullParams when the promise then
                  // handler is executed for lazy loaded routes.
                  RSVP.Promise.resolve(fullParams).then(capturedFullParams => {
                    route.then(resolvedRoute => {
                      if (this.isDestroying || transition.isAborted) {
                        return;
                      }

                      resolvedRoute._prefetched = RSVP.Promise.resolve(
                        resolvedRoute.prefetch(capturedFullParams, transition)
                      );
                    });
                  });
                } else {
                  route._prefetched = RSVP.Promise.resolve(route.prefetch(fullParams, transition));
                }

                seenRoutes.set(route, true);
                if (transition.isAborted) return;
              }
            }
          }
        });
      });

      this.router.on('routeDidChange', () => {
        seenRoutes = new WeakMap();
      });
    },
  });
}

export default PrefetchService;
