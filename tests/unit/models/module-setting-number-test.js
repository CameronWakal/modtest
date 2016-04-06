import { moduleForModel, test } from 'ember-qunit';

moduleForModel('module-setting-number', 'Unit | Model | module setting number', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
