import DS from 'ember-data';
import Ember from 'ember';
import Port from './port';

export default Port.extend({
  //valueIn ports can have only one valueOut port as a source

  //todo: get the _super model and the patch controller working with this being a belongsTo
  connection: DS.belongsTo('port-value-out', {async: false}),

});
