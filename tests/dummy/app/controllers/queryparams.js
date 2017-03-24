import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: [
    'foo',
    'fib',
    'fiz',
  ],
  foo: null,
  fib: null,
  fiz: null,
});
