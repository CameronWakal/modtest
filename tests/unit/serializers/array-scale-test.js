import { moduleForModel, test } from 'ember-qunit';

moduleForModel('array-scale', 'Unit | Serializer | array scale', {
  // Specify the other units that are required for this test.
  needs: ['serializer:array-scale']
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
