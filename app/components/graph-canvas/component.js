import Ember from 'ember';

const {
  Component,
  $,
  observer,
  run,
  get,
  set
} = Ember;

const minX = -1500;
const minY = -1500;
const maxX = 1500;
const maxY = 4500;
const width = 200;
const height = 400;

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
    ctx.lineWidth = 1 * pxRatio;
    ctx.strokeStyle = 'rgba(127, 127, 127, 0.3)';
    ctx.beginPath();

    let rangeX = maxX - minX;
    let rangeY = maxY - minY;

    let axis = ((0 - minX) / rangeX) * width;
    ctx.moveTo(axis * pxRatio, 0);
    ctx.lineTo(axis * pxRatio, height * pxRatio);

    axis = height - ((0 - minY) / rangeY) * height;
    ctx.moveTo(0, axis * pxRatio);
    ctx.lineTo(height * pxRatio, axis * pxRatio);

    ctx.stroke()
    ctx.fillStyle = '#fff';

    let x, y;

    let values = get(this, 'values');
    values.forEach((value) => {

      x = ((value.x - minX) / rangeX) * width;
      y = height - ((value.y - minY) / rangeY) * height;

      ctx.fillRect(x * pxRatio, y * pxRatio, 1 * pxRatio, 1 * pxRatio);

    }, this);

  },

});
