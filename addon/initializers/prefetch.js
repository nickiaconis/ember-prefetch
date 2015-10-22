import Ember from 'ember';
import RouteMixin from 'ember-prefetch/mixins/route';

let hasInitialized = false;

export function initialize() {
  if (!hasInitialized) {
    hasInitialized = true;

    Ember.Route.reopen(RouteMixin);
  }
}

export default {
  name: 'prefetch',
  initialize: initialize
};
