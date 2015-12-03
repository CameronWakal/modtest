import Ember from 'ember';
import PatchableMixin from '../../../mixins/patchable';
import { module, test } from 'qunit';

module('Unit | Mixin | patchable');

// Replace this with your real tests.
test('it works', function(assert) {
  var PatchableObject = Ember.Object.extend(PatchableMixin);
  var subject = PatchableObject.create();
  assert.ok(subject);
});
