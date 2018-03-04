import Component from '@ember/component';
import { computed, get, set, observer } from '@ember/object';

export default Component.extend({

  actions: {
    busChanged(bus) {
      if (!bus.id) {
        get(this, 'disconnectFromBus')();
      } else {
        get(this, 'connectToBus')(bus);
      }
    }
  },

  menuItems: computed('busses', function() {
    return [{ title: 'off' }, ...get(this, 'busses').toArray()];
  }),

  selectedMenuItem: computed('connectedBus', function() {
    let connectedBus = get(this, 'connectedBus');
    if (connectedBus) {
      return connectedBus;
    } else {
      return { title: 'off' };
    }
  })

});
