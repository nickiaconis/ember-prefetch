/* eslint-env node */
'use strict';

// eslint-disable-next-line node/no-extraneous-require
const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'lazy-engine',

  lazyLoading: Object.freeze({
    enabled: true,
  }),

  isDevelopingAddon() {
    return true;
  },
});
