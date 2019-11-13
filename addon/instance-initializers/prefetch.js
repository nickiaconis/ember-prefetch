import { assign } from '@ember/polyfills';
import { resolve } from 'rsvp';
import { gte } from 'ember-compatibility-helpers';

export function initialize(instance) {
  if (!gte('3.6.0')) {
    // Delete all of this in the Ember 3.8 LTS and rev major
    const ROUTER_NAME = 'router:main';
    const router = instance.lookup(ROUTER_NAME);

    router.on('willTransition', function(transition) {
      if (!transition.handlerInfos) {
        return;
      }

      const pivotHandler = transition.pivotHandler;

      // If there is no pivot, we should try to prefetch all handlers.
      let hasSeenPivot = pivotHandler == null ? true : false;

      // For asynchronously loaded handlers, we chain them to ensure
      // resolution order.
      let handlerPromiseChain = resolve();
      transition.handlerInfos.forEach(function(handlerInfo) {
        // Bail if we're tearing down
        if (
          (handlerInfo.handler && handlerInfo.handler.isDestroying === true) ||
          router.isDestroying === true
        ) {
          return;
        }

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
          fullParams = assign({}, fullParams);
          fullParams.queryParams = transition.queryParams;
        }

        // Run the prefetch hook if the route has one.
        if (!handlerInfo.handler && handlerInfo.handlerPromise) {
          handlerPromiseChain = handlerPromiseChain.then(() =>
            handlerInfo.handlerPromise.then(handler => {
              if (handler.isDestroying === true) {
                return;
              }
              handler._prefetched = runHook('prefetch', handlerInfo, transition, [fullParams]);
            })
          );
        } else {
          handlerInfo.handler._prefetched = runHook('prefetch', handlerInfo, transition, [
            fullParams,
          ]);
        }
      });
    });

    // eslint-disable-next-line no-inner-declarations
    function runHook(hookName, handlerInfo, transition, args) {
      /*
        `runSharedModelHook` was deleted as part of an internal cleanup
        and is now moved to a function much like this one. This detects
        if the `runSharedModelHook` exists or not.
        */
      if (handlerInfo.runSharedModelHook === undefined) {
        // This branch will be taken if the version of router_js is >= 2.0.0.
        if (handlerInfo.handler !== undefined && handlerInfo.handler[hookName] !== undefined) {
          if (handlerInfo.queryParams !== undefined) {
            args.push(handlerInfo.queryParams);
          }

          args.push(transition);

          let result;
          if (handlerInfo.handler[`_${hookName}`] !== undefined) {
            result = handlerInfo.handler[`_${hookName}`](...args);
          } else if (handlerInfo.handler[hookName] !== undefined) {
            result = handlerInfo.handler[hookName](...args);
          }

          if (result !== undefined && result.isTransition) {
            result = null;
          }

          return resolve(result);
        }
      } else {
        // This branch will be taken router_js that is < 2.0.0.
        return handlerInfo.runSharedModelHook(transition, hookName, args);
      }
    }
  }
}

export default {
  name: 'prefetch',
  initialize,
};
