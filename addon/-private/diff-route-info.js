import { assign } from '@ember/polyfills';
import { gte } from 'ember-compatibility-helpers';

export let diffQPs;
export let shouldRefreshModel;
export let pathsDiffer;
export let paramsDiffer;
export let createPrefetchChangeSet;

if (gte('3.6.0')) {
  // remove guard for Ember 3.8 LTS and rev major
  function createList(enumerable) { // eslint-disable-line no-inner-declarations
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
    let params = [
      ...Object.keys(from.queryParams),
      ...Object.keys(to.queryParams)
    ];

    for (let param of params) {
      if (from.queryParams[param] !== to.queryParams[param]) {
        diff[param] = true;
      }
    }

    return Object.keys(diff);
  }

  shouldRefreshModel = function(routeQueryParams, changedQPs) {
    let routeQPKeys = Object.keys(routeQueryParams);
    return routeQPKeys.some(key => {
      return routeQueryParams[key].refreshModel && changedQPs.indexOf(key) > -1;
    });
  }

  function paramsMatch(from, to) { // eslint-disable-line no-inner-declarations
    return to.paramNames.every((paramName, i) => {
      return from.paramNames[i] === paramName && from.params[paramName] === to.params[paramName];
    });
  }

  pathsDiffer = function(from, to) {
    let pivotIndex = -1;
    let mismatch = false;
    for (let i = 0; i < to.length; i++) {
      let info = to[i];
      if (info.name !== from[i].name) {
        pivotIndex = i;
        mismatch = true;
        break;
      }
    }

    return [mismatch, pivotIndex];
  }

  paramsDiffer = function(from, to) {
    let pivotIndex = -1;
    let mismatch = false;
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
  }

  function qpsDiffer(privateRouter, to, transition) { // eslint-disable-line no-inner-declarations
    let routes = getPrefetched(privateRouter, to);
    if (transition.from === null) {
      return { shouldCall: true, for: routes };
    }

    let diff = diffQPs(transition.from, transition.to);

    if (diff.length > 0) {
      let prefetchRoutes = [];

      routes.forEach((info) => {
        let { route } = info;
        if (shouldRefreshModel(route.queryParams, diff)) {
          prefetchRoutes.push(info);
        }
      });

      return { shouldCall: true, for: prefetchRoutes };
    }

    return { shouldCall: false, for: [] };
  }

  function getPrefetched(privateRouter, to) { // eslint-disable-line no-inner-declarations
    let routes = [];
    for (let i = 0; i < to.length; i++) {
      let info = to[i];
      let route = privateRouter.getRoute(info.name);
      if (route !== undefined && route !== null) {
        routes.push({ route, fullParams: assign({}, info.params, { queryParams: info.queryParams }) });
      }
    }

    return routes;
  }

  createPrefetchChangeSet = function(privateRouter, transition) {
    let toList = createList(transition.to);
    let fromList = createList(transition.from);

    if (fromList.length === 0) {
      return { shouldCall: true, for: getPrefetched(privateRouter, toList) };
    }

    let pathResult = pathsDiffer(fromList, toList);

    let [_pathsDiffer] = pathResult;

    if (_pathsDiffer) {
      let [, pivot] = pathResult;
      let pivotHandlers = toList.splice(pivot, toList.length);
      return { shouldCall: true, for: getPrefetched(privateRouter, pivotHandlers) };
    }

    let paramsResult = paramsDiffer(fromList, toList);
    let [_paramsDiffer] = paramsResult;

    // Params Changed
    if (_paramsDiffer) {
      let [, pivot] = paramsResult;
      let pivotHandlers = toList.splice(pivot, toList.length);
      return { shouldCall: true, for: getPrefetched(privateRouter, pivotHandlers) };
    }

    // Query Params changed
    return qpsDiffer(privateRouter, toList, transition);
  }
}