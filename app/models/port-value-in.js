import DS from 'ember-data';
import Port from './port';

export default Port.extend({
  //valueIn ports can have only one valueOut port as a source

  //todo: get the _super model and the patch controller working with this being a belongsTo
  connections: DS.hasMany('port-value-out', {async: true}),

  getValue() {
    //sum all input values but leave the result as null if all inputs are null
    var value = null;
    var totalValue = null;
    this.get('connections').forEach(function(port) {
      value = parseInt(port.getValue());
      if( !isNaN(value) ) {
        if( totalValue == null ) {
          totalValue = 0;
        }
        totalValue += value;
      }
    });
    return totalValue;
  },

});
