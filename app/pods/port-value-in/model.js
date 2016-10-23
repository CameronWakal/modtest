import Ember from 'ember';
import DS from 'ember-data';
import Port from '../port/model';

export default Port.extend({

  type: 'port-value-in', //modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  connections: DS.hasMany('port-value-out', {async: true}),
  disabledValue: DS.attr('number'),

  getValue() {

    if(!this.get('isEnabled')) {
      return this.get('disabledValue');
    }

    //sum all input values but leave the result as null if all inputs are null
    var value = null;
    var totalValue = null;
    this.get('connections').forEach( port => {
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

  /*
  onDisabledValueChanged: Ember.observer('disabledValue', function(){
    let module = this.get('module');
    if(module) {
      console.log('port.onDisabledValueChanged() requestSave()');
      module.requestSave();
    }
  })
  */

});
