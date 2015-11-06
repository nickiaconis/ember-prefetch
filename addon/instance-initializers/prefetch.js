import Ember from 'ember';

export function initialize(instance) {
  const ROUTER_NAME = 'router:main';
  const router = (typeof instance.lookup === 'function' ? instance.lookup(ROUTER_NAME) : instance.container.lookup(ROUTER_NAME));

  router.on('willTransition', function(transition) {
    const pivotHandler = transition.pivotHandler;

    // If there is no pivot, we should try to prefetch all handlers.
    let hasSeenPivot = pivotHandler == null ? true : false;

    if (!transition.handlerInfos) {
      return;
    }

    transition.handlerInfos.forEach(function(handlerInfo) {
      // Don't prefetch handlers above the pivot.
      if (!hasSeenPivot) {
        // The pivot is the first common ancestor, so it is skipped as well.
        if (handlerInfo.handler === pivotHandler) {
          hasSeenPivot = true;
        }

        return;
      }

      // Skip handlers that have been provided a model.
      if (handlerInfo.context != null) {
        return;
      }

      // Build fullParams as in unresolved-handler-info-by-param#getModel.
      let fullParams = handlerInfo.params || {};
      if (transition && transition.queryParams) {
        fullParams = Ember.copy(fullParams);
        fullParams.queryParams = transition.queryParams;
      }

      // Run the prefetch hook if the route has one.
      const promise = handlerInfo.runSharedModelHook(transition, 'prefetch', [fullParams]);

      // runSharedModelHook always returns a promise. We check to see if the
      // promise has already resolved with a value of undefined. If it has,
      // the model hook should ignore the prefetched property.
      promise._prefetchReturnedUndefined = (!!promise._state && typeof promise._result === 'undefined');

      handlerInfo.handler.prefetched = promise;
    });
  });
}

export default {
  name: 'prefetch',
  initialize: initialize
};
