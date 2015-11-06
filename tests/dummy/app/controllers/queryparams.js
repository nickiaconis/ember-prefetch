import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['foo', 'fiz'],
  foo: null,
  fiz: null,
});
