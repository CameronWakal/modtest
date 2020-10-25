import Component from '@ember/component';
import { computed, get } from '@ember/object';

export default Component.extend({

  actions: {
    busChanged(bus) {
      if (!bus.id) {
        this.disconnectFromBus();
      } else {
        this.connectToBus(bus);
      }
    }
  },

  menuItems: computed('busses', function() {
    return [{ title: 'off' }, ...this.busses.toArray()];
  }),

  selectedMenuItem: computed('connectedBus', function() {
    let connectedBus = this.connectedBus;
    if (connectedBus) {
      return connectedBus;
    } else {
      return { title: 'off' };
    }
  })

});
