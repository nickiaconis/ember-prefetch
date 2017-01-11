import Ember from 'ember';
import Application from '../../app';
import config from '../../config/environment';

export default function startApp(attrs) {
  let application;

  // use defaults, but you can override
  let attributes;
  if (typeof Ember.assign === 'function') {
    attributes = Ember.assign({}, config.APP, attrs);
  } else {
    attributes = Ember.merge(Ember.merge({}, config.APP), attrs);
  }

  Ember.run(() => {
    application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
  });

  return application;
}
