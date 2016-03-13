import Ember from 'ember';
import DS from 'ember-data';
import Port from './port';

export default Port.extend({
  //valueIn ports can have only one valueOut port as a source

  //todo: get the _super model and the patch controller working with this being a belongsTo
  connections: DS.hasMany('port-value-out', {async: true}),
  disabledValue: DS.attr('number'),

  value: Ember.computed(
    'isEnabled',
    'disabledValue',
    'connections.@each.value',
    function(){
      if(!this.get('isEnabled')) {
        return this.get('disabledValue');
      }
      //sum all input values but leave the result as null if all inputs are null
      var value = null;
      var totalValue = null;
      this.get('connections').forEach( port => {
        value = port.get('value');
        if( value != null ) {
          totalValue = totalValue==null ? 0 : totalValue;
          totalValue += value;
        }
      });
      return totalValue;
    }
  ),

});
