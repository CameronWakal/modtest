import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('module-sequence-step', 'Integration | Component | module sequence step', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{module-sequence-step}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#module-sequence-step}}
      template block text
    {{/module-sequence-step}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
