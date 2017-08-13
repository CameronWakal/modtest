import Ember from 'ember';

const {
  Component,
  $,
  observer,
  run,
  get,
  set
} = Ember;

const minX = -10;
const minY = -10;
const maxX = 10;
const maxY = 10;
const width = 200;
const height = 200;

export default Component.extend({
  classNames: ['graph-canvas'],
  tagName: 'canvas',

  didInsertElement() {
    // bind redraw on window resize
    // $(window).on('resize', run.bind(this, this.drawConnections));
  },

  onValuesChanged: observer('values.@each', function() {
    this.draw();
  }),

  // draw connections between ports,
  // draw line from new connection port to cursor position
  draw() {

    let c = this.$().get(0);
    let ctx = c.getContext('2d');
    let pxRatio = window.devicePixelRatio;
    ctx.canvas.width  = width * pxRatio;
    ctx.canvas.height = height * pxRatio;

    let x, y;
    let rangeX = maxX - minX;
    let rangeY = maxY - minY;

    let values = get(this, 'values');
    values.forEach((value) => {

      x = ((value.x - minX) / rangeX) * width;
      y = ((value.y - minY) / rangeY) * height;

      ctx.beginPath();
      ctx.moveTo(x * pxRatio - 4, y * pxRatio - 4);
      ctx.lineTo(x * pxRatio + 4, y * pxRatio + 4);
      ctx.moveTo(x * pxRatio - 4, y * pxRatio + 4);
      ctx.lineTo(x * pxRatio + 4, y * pxRatio - 4);
      ctx.lineWidth = 1 * pxRatio;
      ctx.strokeStyle = '#fff';

      ctx.stroke();

    }, this);

  },

});
