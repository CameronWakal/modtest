import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  modules: DS.hasMany('module', {polymorphic: true}),
  layoutChanged: false,
  portsChanged: false,

  //super hacky way for the async modules and ports to inform the patch they're
  //ready for a render.
  onModuleReady() {
    
    let modulesReady = this.get('modules').every(function(module, index, self){
      return module.get('isReady');
    });

    if(modulesReady){
      this.set('portsChanged', true);
    }
  },

});
