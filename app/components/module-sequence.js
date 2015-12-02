import ModuleGenericComponent from './module-generic';

export default ModuleGenericComponent.extend({

  classNames: ['module-sequence'],

  init() {
    console.log('moduleSequence init');
    this._super(...arguments);
  }

});
