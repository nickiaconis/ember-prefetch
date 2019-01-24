import Service, { inject as service } from '@ember/service';
import { schedule } from '@ember/runloop';
import { createPrefetchChangeSet } from '../-private/diff-route-info';
import RSVP from 'rsvp';
import { gte } from 'ember-compatibility-helpers';

let PrefetchService;

if (gte('3.6.0')) {
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
          let changeSet = createPrefetchChangeSet(privateRouter, transition);
          if (changeSet.shouldCall) {
            for (let i = 0; i < changeSet.for.length; i++) {
              let { route, fullParms } = changeSet.for[i];
              if (seenRoutes.has(route)) continue;

                let result = route.prefetch(fullParms, transition);
                route._prefetched = RSVP.resolve(result);
                seenRoutes.set(route, true);
                if (transition.isAborted) return;
            }
          }
        });
      });

      this.router.on('routeDidChange', () => {
        seenRoutes = new WeakMap();
      });
    }
  });
}

export default PrefetchService;