import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('value-input-numberfader', 'Integration | Component | value input numberfader', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{value-input-numberfader}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#value-input-numberfader}}
      template block text
    {{/value-input-numberfader}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
