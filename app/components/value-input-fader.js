import Ember from 'ember';

const {
  Component,
  String,
  computed
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
    let range = this.get('max') - this.get('min');
    let steps = range / this.get('step');
    let height = steps * this.get('displayScale');
    return String.htmlSafe(`height:${height}px`);
  })

});
