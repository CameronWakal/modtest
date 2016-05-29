import Ember from 'ember';
import XRangeInputComponent from 'emberx-range-input/components/x-range-input';

//emberx-range-input CLI addon for a range input component,
//polyfilled by rangeslider.js so the slider can be both vertical AND have custom styles

export default XRangeInputComponent.extend({

  attributeBindings: ['data-orientation'],
  'data-orientation': 'vertical',

  onAttrsChanged: Ember.observer('min', 'max', 'step', function(){
    let self = this;
    //seems that if you call rangeslider right away, ember hasn't yet updated the
    //changed attributes in the DOM, so the update doesn't work.
    Ember.run.next(function(){
      self.$().rangeslider('update', true);
    });
  }),

  onValueChanged: Ember.observer('value', function(){
    this.$().val(this.get('value')).change();
  }),

  didInsertElement() {
    this._super();
    var self = this;
    self.$().rangeslider({
      polyfill: false,
      rangeClass: 'rangeslider',
      disabledClass: 'rangeslider-disabled',
      horizontalClass: 'rangeslider-horizontal',
      verticalClass: 'rangeslider-vertical',
      fillClass: 'rangeslider-fill',
      handleClass: 'rangeslider-handle',
    });
  },

  willDestroyElement() {
    this.$().rangeslider('destroy');
    this._super();
  }

});
