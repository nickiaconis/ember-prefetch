import Ember from 'ember';

export function initialize(instance) {
  const ROUTER_NAME = 'router:main';
  const router = (typeof instance.lookup === 'function' ? instance.lookup(ROUTER_NAME) : instance.container.lookup(ROUTER_NAME));

  router.on('willTransition', function(transition) {
    if (!transition.handlerInfos) {
      return;
    }

    const pivotHandler = transition.pivotHandler;

    // If there is no pivot, we should try to prefetch all handlers.
    let hasSeenPivot = pivotHandler == null ? true : false;

    // For asynchronously loaded handlers, we chain them to ensure
    // resolution order.
    let handlerPromiseChain = Ember.RSVP.resolve();
    transition.handlerInfos.forEach(function(handlerInfo) {
      // Don't prefetch handlers above the pivot.
      if (!hasSeenPivot || transition.isAborted) {
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
      if (!handlerInfo.handler && handlerInfo.handlerPromise) {
        handlerPromiseChain = handlerPromiseChain.then(() => (
          handlerInfo.handlerPromise.then((handler) => {
            handler._prefetched = handlerInfo.runSharedModelHook(transition, 'prefetch', [fullParams]);
          })
        ));
      } else {
        handlerInfo.handler._prefetched = handlerInfo.runSharedModelHook(transition, 'prefetch', [fullParams]);
      }
    });
  });
}

export default {
  name: 'prefetch',
  initialize: initialize
};
