import DS from 'ember-data';

export default DS.Model.extend({
  value: DS.attr('string'),

  save() {
    this._super({adapterOptions: {dontPersist: true}});
  }
  
});
