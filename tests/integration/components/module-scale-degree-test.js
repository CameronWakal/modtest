import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('module-scale-degree', 'Integration | Component | module scale degree', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{module-scale-degree}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#module-scale-degree}}
      template block text
    {{/module-scale-degree}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
