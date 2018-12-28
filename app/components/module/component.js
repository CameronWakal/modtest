import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import $ from 'jquery';
import { run } from '@ember/runloop';
import { set, get, observer, computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  classNames: ['module'],
  classNameBindings: [
    'portIsConnectingFrom:port-connecting-from',
    'module.isNew:is-new'
  ],
  attributeBindings: ['inlineStyles:style', 'tabindex'],
  tabindex: -1,

  isMoving: false,
  didMove: false,
  moveOffsetX: null,
  moveOffsetY: null,
  portIsConnectingFrom: false,

  xPos: alias('module.xPos'),
  yPos: alias('module.yPos'),

  inlineStyles: computed('xPos', 'yPos', function() {
    let styleString = `left:${this.xPos}px; top:${this.yPos}px`;
    return htmlSafe(styleString);
  }),

  onPortsChanged: observer('module.ports.@each.isEnabled', function() {
    this.portsChanged();
  }),

  init() {
    this._super(...arguments);

    if (this.module.isNew) {
      this.isMoving = true;
      $(document).on('mouseup', this.mouseUpBody.bind(this));
      $(document).on('mousemove', this.mouseMoveBody.bind(this));
    }
  },

  actions: {
    remove() {
      this.remove();
    },
    selectPort(port) {
      this.selectPort(port);
    },

    portStartedConnecting(port) {
      set(this, 'portIsConnectingFrom', true);
      this.portStartedConnecting(port);
    },

    portFinishedConnecting() {
      set(this, 'portIsConnectingFrom', false);
      this.portFinishedConnecting();
    },

    mouseEnterPort(port) {
      this.mouseEnterPort(port);
    },

    mouseLeavePort(port) {
      this.mouseLeavePort(port);
    },

    disconnectPort(port) {
      port.disconnect();
      this.portDisconnected(port);
    }

  },

  mouseDown(event) {
    if ($(event.target).hasClass('module')
      || $(event.target).hasClass('module-label')
      || $(event.target).hasClass('module-ports')
      || $(event.target).hasClass('indicator-blinking')
    ) {
      this.isMoving = true;
      this.moveOffsetX = event.pageX - this.xPos;
      this.moveOffsetY = event.pageY - this.yPos;
      $(document).on('mouseup', this.mouseUpBody.bind(this));
      $(document).on('mousemove', this.mouseMoveBody.bind(this));
      this.selected();
      this.startedMoving();
    }
  },

  keyDown(event) {
    if (event.keyCode === 8 && this.$().is(':focus')) {
      event.preventDefault();
      this.remove();
    }
  },

  mouseMoveBody(event) {
    event.preventDefault();
    let self = this;
    run(function() {
      set(self, 'didMove', true);

      // moveOffsets will be null if this is a new module created by drag-and-drop,
      // since the drag started with init() instead of mouseDown()
      if (get(self, 'moveOffsetX') == null) {
        set(self, 'moveOffsetX', event.pageX - get(self, 'xPos'));
      }
      if (get(self, 'moveOffsetY') == null) {
        set(self, 'moveOffsetY', event.pageY - get(self, 'yPos'));
      }

      set(self, 'xPos', event.pageX - get(self, 'moveOffsetX'));
      set(self, 'yPos', event.pageY - get(self, 'moveOffsetY'));
    });
  },

  mouseUpBody(event) {
    event.preventDefault();
    let self = this;
    run(function() {
      set(self, 'isMoving', false);
      if (get(self, 'didMove')) {

        // saving of new modules is deferred until the end of the initial drag operation.
        // enable future autosaves on the module and save the patch.
        if (get(self, 'module.isNew')) {
          set(self, 'module.shouldAutoSave', true);
          self.savePatch();
        }

        get(self, 'module').requestSave();
        set(self, 'didMove', false);
      }
      self.finishedMoving();
      $(document).off('mouseup');
      $(document).off('mousemove');
    });
  }

});
