import { moduleForModel, test } from 'ember-qunit';

moduleForModel('module-clock-div', 'Unit | Serializer | module clock div', {
  // Specify the other units that are required for this test.
  needs: ['serializer:module-clock-div']
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
