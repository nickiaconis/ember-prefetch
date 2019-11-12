import Service, { inject as service } from '@ember/service';
import { schedule } from '@ember/runloop';
import { createPrefetchChangeSet } from '../-private/diff-route-info';
import RSVP from 'rsvp';
import { gte } from 'ember-compatibility-helpers';

let PrefetchService;

if (gte('3.6.0')) {
  let substatesRegex = /(^|_|\.)(loading$|error$)/;
  // remove guard for Ember 3.8 LTS and rev major
  PrefetchService = Service.extend({
    router: service('router'),
    init() {
      this._super(...arguments);
      let privateRouter = this.router._router._routerMicrolib;
      let seenRoutes = new WeakMap();

      this.router.on('routeWillChange', transition => {
        if (transition.to && substatesRegex.test(transition.to.name)) {
          return;
        }

        schedule('actions', () => {
          if (!this.isDestroying && !this.isDestroyed) {
            let changeSet = createPrefetchChangeSet(privateRouter, transition);
            if (changeSet.shouldCall) {
              for (let i = 0; i < changeSet.for.length; i++) {
                let { route, fullParams } = changeSet.for[i];
                if (seenRoutes.has(route)) continue;

                route._prefetched = new RSVP.Promise(r => {
                  return r(route.prefetch(fullParams, transition));
                });
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
