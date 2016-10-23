import DS from 'ember-data';

export default DS.Model.extend({
  modules: DS.hasMany('module', {polymorphic: true}),

  save() {
    if( !this.get('isDeleted') ) {
      console.log('PATCH SAVE');
    } else {
      console.log('PATCH DELETE');
    }
    this._super();
  }

});
