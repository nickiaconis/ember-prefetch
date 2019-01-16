import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: [
    'foo',
    'fib',
    'fiz',
  ],
  foo: null,
  fib: null,
  fiz: null,
});
