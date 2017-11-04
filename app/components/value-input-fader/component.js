import { empty } from '@ember/object/computed';
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({

  classNames: ['value-input-fader'],
  classNameBindings: [
    'noValue:no-value',
    'item.isCurrentItem:current'
  ],
  attributeBindings: ['inlineStyles:style'],

  noValue: empty('item.value'),
  inlineStyles: computed('displayScale', 'min', 'max', 'step', function() {
    let range = get(this, 'max') - get(this, 'min');
    let steps = range / get(this, 'step');
    let height = steps * get(this, 'displayScale');
    return htmlSafe(`height:${height}px`);
  })

});
