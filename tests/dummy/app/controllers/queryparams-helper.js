import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: [
    'fix',
    'fuzz',
  ],
  fix: null,
  fuzz: null,
});
