import DS from 'ember-data';
import ModuleSetting from './module-setting';

export default ModuleSetting.extend({

  items: DS.hasMany('item-string', {async:false}),

});
