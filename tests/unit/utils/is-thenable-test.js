import { isThenable } from 'ember-prefetch/-private/utils/is-thenable';
import { module, test } from 'qunit';

module('Unit | Utility | is-thenable', function() {
  test('basic sanity check', function(assert) {
    const thenable = { then: () => {} };
    assert.equal(isThenable(thenable), true, 'returns true for thenable');
    assert.equal(isThenable({}), false, 'returns false for non thenable');
    assert.equal(isThenable(), false, 'returns false for undefined');
    assert.equal(isThenable(null), false, 'returns false for null');
  });
});
