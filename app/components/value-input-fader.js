import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['value-input-fader'],
  classNameBindings: ['noValue:no-value'],

  noValue: Ember.computed.empty('value'),

});
