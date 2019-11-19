import { assign } from '@ember/polyfills';
import { gte } from 'ember-compatibility-helpers';
import { assert } from '@ember/debug';

export let diffQPs;
export let shouldRefreshModel;
export let pathsDiffer;
export let paramsDiffer;
export let createPrefetchChangeSet;
export let pathsRefresh;

if (gte('3.6.0')) {
  // remove guard for Ember 3.8 LTS and rev major
  // eslint-disable-next-line no-inner-declarations
  function createList(enumerable) {
    let out = [];

    if (enumerable === null) return out;

    enumerable.find(item => {
      out.push(item);
      // using `find` to emulate forEach
      return false;
    });
    return out;
  }

  diffQPs = function(from, to) {
    let diff = {};
    let params = [...Object.keys(from.queryParams), ...Object.keys(to.queryParams)];

    for (let param of params) {
      if (from.queryParams[param] !== to.queryParams[param]) {
        diff[param] = true;
      }
    }

    return Object.keys(diff);
  };

  shouldRefreshModel = function(routeQueryParams, changedQPs) {
    let routeQPKeys = Object.keys(routeQueryParams);
    return routeQPKeys.some(key => {
      return routeQueryParams[key].refreshModel && changedQPs.indexOf(key) > -1;
    });
  };

  // eslint-disable-next-line no-inner-declarations
  function paramsMatch(from, to) {
    return to.paramNames.every((paramName, i) => {
      return from.paramNames[i] === paramName && from.params[paramName] === to.params[paramName];
    });
  }

  /**
   * This method checks if from and to routes are navigating away from current route.
   * For e.g. one navigating from `profile.view` to `profile.details`
   *
   * @method pathsDiffer
   * @param {Object} from - from route list
   * @param {Object} to - to route list
   * @return {Array} An array containing mismatch and pivotIndex.
   * @public
   */
  pathsDiffer = function(from, to) {
    let pivotIndex = -1;
    let mismatch = false;
    for (let i = 0; i < to.length; i++) {
      let info = to[i];
      if (info.name !== from[i].name || !paramsMatch(info, from[i])) {
        pivotIndex = i;
        mismatch = true;
        break;
      }
    }

    return [mismatch, pivotIndex];
  };

  /**
   * This check only validate if from and to routes are identical but contains different
   * parameters.
   *
   * @method paramsDiffer
   * @param {Object} from - from route list
   * @param {Object} to - to route list
   * @return {Array} An array containing mismatch and pivotIndex.
   * @public
   */
  paramsDiffer = function(from, to) {
    let pivotIndex = -1;
    let mismatch = false;

    if (from.length !== to.length) {
      return [mismatch, pivotIndex];
    }

    for (let i = 0; i < to.length; i++) {
      let info = to[i];
      let _from = from[i];
      if (info.paramNames.length !== _from.paramNames.length || !paramsMatch(_from, info)) {
        pivotIndex = i;
        mismatch = true;
        break;
      }
    }

    return [mismatch, pivotIndex];
  };

  // eslint-disable-next-line no-inner-declarations
  function qpsDiffer(privateRouter, to, transition) {
    let routes = getPrefetched(privateRouter, to);
    if (transition.from === null) {
      return { shouldCall: true, for: routes };
    }

    let diff = diffQPs(transition.from, transition.to);

    if (diff.length > 0) {
      let prefetchRoutes = [];

      routes.forEach(info => {
        let { route } = info;
        if (shouldRefreshModel(route.queryParams, diff)) {
          prefetchRoutes.push(info);
        }
      });

      return { shouldCall: true, for: prefetchRoutes };
    }

    return { shouldCall: false, for: [] };
  }

  // eslint-disable-next-line no-inner-declarations
  function getPrefetched(privateRouter, to) {
    let routes = [];
    for (let i = 0; i < to.length; i++) {
      let info = to[i];
      let route = privateRouter.getRoute(info.name);
      if (route !== undefined && route !== null) {
        routes.push({
          route,
          fullParams: assign({}, info.params, { queryParams: info.queryParams }),
        });
      }
    }

    return routes;
  }

  // This should be invoked if there are no results for queryparams diff(qpsDiff) due to overlapping logic
  pathsRefresh = function(from, to, intent) {
    let pivotIndex = -1;
    let hasMatch = false;

    if (!from || !intent || from.length !== to.length || !intent.pivotHandler) {
      return [hasMatch, pivotIndex];
    }

    // only route.refresh and route.refreshModel hook have `NamedTransitionIntent` and has fullRouteName
    const refreshRouteName = intent.pivotHandler.fullRouteName;

    for (let i = 0; i < from.length; i++) {
      if (from[i].name === refreshRouteName) {
        return [true, i];
      }
    }
    assert(
      'This return section should not be reachable. `refreshRouteName` should be always present for `route.refresh()`'
    );
    return [hasMatch, pivotIndex];
  };

  /**
    This function checks transition in sequence
    1. param has changed
    2. route has changed
    3. query param has changed
    4. refresh has invoked from route

    This checking sequence is important, changing sequence could impact in weird ways.
    For examample, query param invokes route.refresh() if refreshModel is set true on route level.
    If #4 has invoked prior to #3, it will visit index route of refreshModel hence involves in additional API invocation

    @method createPrefetchChangeSet
    @param {Object} privateRouter - router
    @param {Object} transition - transition object
    @return {Object} An object containing `shouldCall` to invoke prefetch promise on each route and `for` to iterate through affected routes
    @public
  */
  createPrefetchChangeSet = function(privateRouter, transition) {
    let toList = createList(transition.to);
    let fromList = createList(transition.from);

    if (fromList.length === 0) {
      return { shouldCall: true, for: getPrefetched(privateRouter, toList) };
    }

    let paramsResult = paramsDiffer(fromList, toList);
    let [_paramsDiffer] = paramsResult;

    // Params Changed
    if (_paramsDiffer) {
      let [, pivot] = paramsResult;
      let pivotHandlers = toList.splice(pivot, toList.length);
      return { shouldCall: true, for: getPrefetched(privateRouter, pivotHandlers) };
    }

    // Path has changed
    let pathResult = pathsDiffer(fromList, toList);

    let [_pathsDiffer] = pathResult;

    if (_pathsDiffer) {
      let [, pivot] = pathResult;
      let pivotHandlers = toList.splice(pivot, toList.length);
      return { shouldCall: true, for: getPrefetched(privateRouter, pivotHandlers) };
    }

    // Query Params changed
    let qpsResult = qpsDiffer(privateRouter, toList, transition);
    if (qpsResult.shouldCall) {
      return qpsResult;
    }

    // route.refresh has invoked
    let refreshResult = pathsRefresh(fromList, toList, transition.intent);
    let [_isRefresh] = refreshResult;

    if (_isRefresh) {
      let [, pivot] = refreshResult;
      let pivotHandlers = toList.splice(pivot);
      return { shouldCall: true, for: getPrefetched(privateRouter, pivotHandlers) };
    }

    return { shouldCall: false };
  };
}
