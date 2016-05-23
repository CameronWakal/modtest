import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('value-array-input-number', 'Integration | Component | value array input number', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{value-array-input-number}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#value-array-input-number}}
      template block text
    {{/value-array-input-number}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
