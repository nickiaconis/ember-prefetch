import RSVP from 'rsvp';

/**
 * Modifies the Router to return a Promise from it's `getHandler` method. This
 * is used to simulate what happens when loading a lazy Engine.
 */
export default function setupRouterForEngine(hooks) {
  let getRoute;
  hooks.beforeEach(function() {
    let router = this.owner.lookup('router:main');
    router.reopen({
      setupRouter() {
        this._super(...arguments);

        getRoute = this._routerMicrolib.getRoute;
        this._enginePromises = Object.create(null);
        this._resolvedEngines = Object.create(null);

        this._routerMicrolib.getRoute = name => {
          let engineInfo = this._engineInfoByRoute[name];
          if (!engineInfo) {
            return getRoute(name);
          }

          let engineName = engineInfo.name;
          if (this._resolvedEngines[engineName]) {
            return getRoute(name);
          }

          let enginePromise = this._enginePromises[engineName];

          if (!enginePromise) {
            enginePromise = new RSVP.Promise(resolve => {
              setTimeout(() => {
                this._resolvedEngines[engineName] = true;

                resolve();
              }, 1);
            });
            this._enginePromises[engineName] = enginePromise;
          }

          return enginePromise.then(() => getRoute(name));
        };
      },
    });

    /**
     * This override is copied from what ember-engines does. It allows handlers to
     * be loaded asynchronously by not checking the handler directly for meta info
     */
    router._getQPMeta = function _newGetQPMeta(handlerInfo) {
      return this._bucketCache.lookup('route-meta', handlerInfo.name);
    };
  });

  hooks.afterEach(function() {
    this.owner.lookup('router:main')._routerMicrolib.getRoute = getRoute;
  });
}
