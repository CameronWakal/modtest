import { run } from '@ember/runloop';
import { observer } from '@ember/object';
import XRangeInputComponent from 'emberx-range-input/components/x-range-input';

// emberx-range-input CLI addon for a range input component,
// polyfilled by rangeslider.js so the slider can be both vertical AND have custom styles

export default XRangeInputComponent.extend({

  attributeBindings: ['data-orientation'],
  'data-orientation': 'vertical',

  onAttrsChanged: observer('min', 'max', 'step', function() {
    let self = this;
    // seems that if you call rangeslider right away, ember hasn't yet updated the
    // changed attributes in the DOM, so the update doesn't work.
    run.next(function() {
      self.$().rangeslider('update', true);
    });
  }),

  onDisplayScaleChanged: observer('displayScale', function() {
    // in the case of the new height, the update delay doesn't seem to be required.
    this.$().rangeslider('update', true);
  }),

  onValueChanged: observer('value', function() {
    this.element.value = this.value;
    this.element.dispatchEvent(new Event('change'));
  }),

  didInsertElement() {
    this._super();
    let self = this;
    self.$().rangeslider({
      polyfill: false,
      rangeClass: 'rangeslider',
      disabledClass: 'rangeslider-disabled',
      horizontalClass: 'rangeslider-horizontal',
      verticalClass: 'rangeslider-vertical',
      fillClass: 'rangeslider-fill',
      handleClass: 'rangeslider-handle'
    });
  },

  willDestroyElement() {
    this.$().rangeslider('destroy');
    this._super();
  }

});
