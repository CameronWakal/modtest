import Ember from 'ember';

const {
  Component,
  computed,
  observer,
  String,
  $,
  run,
  get
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
    let styleString = `left:${this.get('xPos')}px; top:${this.get('yPos')}px`;
    return new String.htmlSafe(styleString);
  }),

  onPortsChanged: observer('module.ports.@each.isEnabled', function() {
    this.sendAction('portsChanged');
  }),

  init() {
    this._super(...arguments);

    if (get(this, 'module.isNew')) {
      this.set('isMoving', true);
      $(document).on('mouseup', this.mouseUpBody.bind(this));
      $(document).on('mousemove', this.mouseMoveBody.bind(this));
    }
  },

  didInsertElement() {
      if (get(this, 'module.isNew')) {
        this.$().focus();
      }
  },

  mouseDown(event) {
    if ($(event.target).hasClass('module') ||
        $(event.target).hasClass('module-label')
      ) {
      this.set('isMoving', true);
      this.set('moveOffsetX', event.pageX - this.get('xPos'));
      this.set('moveOffsetY', event.pageY - this.get('yPos'));
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
      self.set('didMove', true);

      // moveOffsets will be null if this is a new module created by drag-and-drop,
      // since the drag started with init() instead of mouseDown()
      if (get(self, 'moveOffsetX') == null) {
        self.set('moveOffsetX', event.pageX - self.get('xPos'));
      }
      if (get(self, 'moveOffsetY') == null) {
        self.set('moveOffsetY', event.pageY - self.get('yPos'));
      }

      self.set('xPos', event.pageX - self.get('moveOffsetX'));
      self.set('yPos', event.pageY - self.get('moveOffsetY'));
    });
  },

  mouseUpBody(event) {
    event.preventDefault();
    let self = this;
    run(function() {
      self.set('isMoving', false);
      if (self.get('didMove')) {

        // saving of new modules is deferred until the end of the initial drag operation.
        // enable future autosaves on the module and save the patch.
        if (self.get('module.isNew')) {
          self.set('module.shouldAutoSave', true);
          self.sendAction('savePatch');
        }

        self.get('module').requestSave();
        self.set('didMove', false);
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
      this.set('portIsConnectingFrom', true);
      this.sendAction('portStartedConnecting', port);
    },

    portFinishedConnecting() {
      this.set('portIsConnectingFrom', false);
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
