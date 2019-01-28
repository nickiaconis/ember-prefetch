import { assign } from '@ember/polyfills';
import { gte } from 'ember-compatibility-helpers';

export let qpsChanged;
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

  qpsChanged = function(from, to) {
    let fromQps = Object.keys(from.queryParams).sort();
    let toQps = Object.keys(to.queryParams).sort();

    if (fromQps.length !== toQps.length) return true;

    return !toQps.every((qp, i)=> {
      return fromQps[i] === qp && to.queryParams[qp] === from.queryParams[qp];
    });
  }

  shouldRefreshModel = function(routeQueryParams, infoQueryParams) {
    let routeQPKeys = Object.keys(routeQueryParams);
    let infoQPKeys = Object.keys(infoQueryParams);
    return routeQPKeys.some(key => {
      return routeQueryParams[key].refreshModel && infoQPKeys.indexOf(key) > -1;
    });
  }

  function paramsMatch(from, to) { // eslint-disable-line no-inner-declarations
    return to.paramNames.every((paramName, i) => {
      return from.paramNames[i] === paramName && from.params[paramName] === to.params[paramName];
    });
  }

  pathsDiffer = function(from, to) {
    return !to.every((info, i) => {
      return info.name === from[i].name;
    })
  }

  paramsDiffer = function(from, to) {
    return !to.every((info, i) => {
      let _from = from[i];
      let _to = info;
      return _to.paramNames.length === _from.paramNames.length && paramsMatch(_from, _to)
    });
  }

  function qpsDiffer(privateRouter, to, transition) { // eslint-disable-line no-inner-declarations
    let routes = getPrefetched(privateRouter, to);
    if (transition.from === null) {
      return { shouldCall: true, for: routes };
    }

    if (qpsChanged(transition.from, transition.to)) {
      let prefetchRoutes = [];

      routes.forEach((info) => {
        let { route } = info;
        if (shouldRefreshModel(route.queryParams, transition.to.queryParams)) {
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

    // Paths Changed
    if (toList.length !== fromList.length) {
      return { shouldCall: true, for: getPrefetched(privateRouter, toList) };
    }

    if (pathsDiffer(fromList, toList)) {
      return { shouldCall: true, for: getPrefetched(privateRouter, toList) };
    }

    // Params Changed
    if (paramsDiffer(fromList, toList)) {
      return { shouldCall: true, for: getPrefetched(privateRouter, toList) };
    }

    // Query Params changed
    return qpsDiffer(privateRouter, toList, transition);
  }
}