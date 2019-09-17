import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  prefetch() {
    return RSVP.Promise.resolve({ test: 'test prefetch hook' });
  },
});
