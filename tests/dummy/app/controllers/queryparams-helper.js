import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['fix', 'fuzz'],
  fix: null,
  fuzz: null,
});
