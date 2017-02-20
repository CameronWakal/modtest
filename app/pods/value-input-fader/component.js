import Ember from 'ember';

const {
  Component,
  String,
  computed,
  get
} = Ember;

export default Component.extend({

  classNames: ['value-input-fader'],
  classNameBindings: [
    'noValue:no-value',
    'item.isCurrentItem:current'
  ],
  attributeBindings: ['inlineStyles:style'],

  noValue: computed.empty('item.value'),
  inlineStyles: computed('displayScale', 'min', 'max', 'step', function() {
    let range = get(this, 'max') - get(this, 'min');
    let steps = range / get(this, 'step');
    let height = steps * get(this, 'displayScale');
    return String.htmlSafe(`height:${height}px`);
  })

});
