import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['value-input-fader'],
  classNameBindings: [
    'noValue:no-value',
    'item.isCurrentItem:current'
  ],
  attributeBindings: ['inlineStyles:style'],

  noValue: Ember.computed.empty('item.value'),
  inlineStyles: Ember.computed('displayScale','min','max','step', function() {
    let range = this.get('max') - this.get('min');
    let steps = range / this.get('step');
    let height = steps * this.get('displayScale');
    return Ember.String.htmlSafe('height:'+height+'px');
  })

});
