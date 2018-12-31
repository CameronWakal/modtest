import DS from 'ember-data';

const { Model, hasMany } = DS;

export default Model.extend({
  ports: hasMany('port', { polymorphic: true, async: false }),
});
