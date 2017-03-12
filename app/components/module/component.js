import Ember from 'ember';

const {
  Component,
  computed,
  observer,
  String,
  $,
  run,
  get,
  set
} = Ember;

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
  xPos: computed.alias('module.xPos'),
  yPos: computed.alias('module.yPos'),

  portIsConnectingFrom: false,

  inlineStyles: computed('xPos', 'yPos', function() {
    let styleString = `left:${get(this, 'xPos')}px; top:${get(this, 'yPos')}px`;
    return new String.htmlSafe(styleString);
  }),

  onPortsChanged: observer('module.ports.@each.isEnabled', function() {
    this.sendAction('portsChanged');
  }),

  init() {
    this._super(...arguments);

    if (get(this, 'module.isNew')) {
      set(this, 'isMoving', true);
      $(document).on('mouseup', this.mouseUpBody.bind(this));
      $(document).on('mousemove', this.mouseMoveBody.bind(this));
    }
  },

  mouseDown(event) {
    if ($(event.target).hasClass('module') ||
        $(event.target).hasClass('module-label')
      ) {
      set(this, 'isMoving', true);
      set(this, 'moveOffsetX', event.pageX - get(this, 'xPos'));
      set(this, 'moveOffsetY', event.pageY - get(this, 'yPos'));
      $(document).on('mouseup', this.mouseUpBody.bind(this));
      $(document).on('mousemove', this.mouseMoveBody.bind(this));
      this.sendAction('selected');
      this.sendAction('startedMoving');
    }
  },

  keyDown(event) {
    if (event.keyCode === 8 && this.$().is(':focus')) {
      event.preventDefault();
      this.sendAction('remove');
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
          self.sendAction('savePatch');
        }

        get(self, 'module').requestSave();
        set(self, 'didMove', false);
      }
      self.sendAction('finishedMoving');
      $(document).off('mouseup');
      $(document).off('mousemove');
    });
  },

  actions: {
    remove() {
      this.attrs.remove();
    },
    selectPort(port) {
      this.attrs.selectPort(port);
    },

    portStartedConnecting(port) {
      set(this, 'portIsConnectingFrom', true);
      this.sendAction('portStartedConnecting', port);
    },

    portFinishedConnecting() {
      set(this, 'portIsConnectingFrom', false);
      this.sendAction('portFinishedConnecting');
    },

    mouseEnterPort(port) {
      this.sendAction('mouseEnterPort', port);
    },

    mouseLeavePort(port) {
      this.sendAction('mouseLeavePort', port);
    },

    disconnectPort(port) {
      port.disconnect();
      this.sendAction('portDisconnected', port);
    }

  }

});