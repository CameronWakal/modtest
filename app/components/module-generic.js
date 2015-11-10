import Ember from 'ember';
import Port from '../custom_objects/port';


export default Ember.Component.extend({
  actions: {
    removeSelf() {
      this.sendAction('removeModule', this.get('module'));
    }
  },
  ports: [
    Port.create({ signalType:'trigger', portType:'source', name:'Trigger Out'}),
    Port.create({ signalType:'signal', portType:'source', name:'Tempo Out'}),
  ],
});
