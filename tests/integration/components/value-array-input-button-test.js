import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('value-array-input-button', 'Integration | Component | value array input button', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{value-array-input-button}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#value-array-input-button}}
      template block text
    {{/value-array-input-button}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
