import DS from 'ember-data';

export default DS.Model.extend({
  
  module: DS.belongsTo('module', { inverse: 'out'})

});
