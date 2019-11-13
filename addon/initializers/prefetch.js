import Route from '@ember/routing/route';
import RouteMixin from 'ember-prefetch/mixins/route';
import { gte } from 'ember-compatibility-helpers';

Route.reopen(RouteMixin);

export function initialize(application) {
  if (gte('3.6.0')) {
    application.inject('route:application', '__prefetch', 'service:prefetch');
  }
}

export default {
  name: 'prefetch',
  initialize: initialize,
};
