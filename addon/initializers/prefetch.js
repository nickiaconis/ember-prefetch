import Route from '@ember/routing/route';
import RouteMixin from 'ember-prefetch/mixins/route';

let hasInitialized = false;

export function initialize() {
  if (!hasInitialized) {
    hasInitialized = true;

    Route.reopen(RouteMixin);
  }
}

export default {
  name: 'prefetch',
  initialize: initialize
};
