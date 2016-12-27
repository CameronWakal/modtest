import DS from 'ember-data';

const {
  Model,
  attr
} = DS;

export default Model.extend({
  value: attr('string'),

  save() {
    this._super({ adapterOptions: { dontPersist: true } });
  }

});
