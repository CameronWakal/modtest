import { mod, div } from 'modtest/utils/math-util';
import { module, test } from 'qunit';

module('Unit | Utility | math util', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    let result = mod(3, 2);
    assert.ok(result);
    result = div(3, 2);
    assert.ok(result);
  });
});
