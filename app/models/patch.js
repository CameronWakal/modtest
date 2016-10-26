import DS from 'ember-data';

export default DS.Model.extend({
  modules: DS.hasMany('module', {polymorphic: true}),

  save() {
    if( !this.get('isDeleted') ) {
      console.log('patch save');
    } else {
      console.log('patch delete');
    }
    this._super();
  }

});
