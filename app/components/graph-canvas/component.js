import Ember from 'ember';

const {
  Component,
  $,
  observer,
  run,
  get,
  set,
  computed,
  String
} = Ember;

export default Component.extend({
  classNames: ['graph-canvas'],
  tagName: 'canvas',
  attributeBindings: ['inlineStyles:style'],

  width: computed('xMin', 'xMax', 'xScale', function() {
    return (get(this, 'xMax') - get(this, 'xMin')) * get(this, 'xScale');
  }),
  height: computed('yMin', 'yMax', 'yScale', function() {
    return (get(this, 'yMax') - get(this, 'yMin')) * get(this, 'yScale');
  }),

  inlineStyles: computed('width', 'height', function() {
    let styleString = `width:${get(this, 'width')}px; height:${get(this, 'height')}px`;
    return new String.htmlSafe(styleString);
  }),

  didInsertElement() {
    // bind redraw on window resize
    // $(window).on('resize', run.bind(this, this.drawConnections));
  },

  onValuesChanged: observer(
    'lineValues.@each',
    'xMin',
    'xMax',
    'yMin',
    'yMax',
    'xScale',
    'yScale',
    function() {
      this.draw();
  }),

  // draw connections between ports,
  // draw line from new connection port to cursor position
  draw() {

    let c = this.$().get(0);
    let ctx = c.getContext('2d');
    let pxRatio = window.devicePixelRatio;
    let width = get(this, 'width');
    let height = get(this, 'height');
    let minX = get(this, 'xMin') * 1000;
    let maxX = get(this, 'xMax') * 1000;
    let minY = get(this, 'yMin') * 1000;
    let maxY = get(this, 'yMax') * 1000;
    ctx.canvas.width  = width * pxRatio;
    ctx.canvas.height = height * pxRatio;
    ctx.lineWidth = 1 * pxRatio;
    ctx.strokeStyle = 'rgba(44, 49, 58, 0.8)';
    ctx.beginPath();

    let rangeX = maxX - minX;
    let rangeY = maxY - minY;

    let axis = ((0 - minX) / rangeX) * width;
    ctx.moveTo(Math.round(axis * pxRatio), 0);
    ctx.lineTo(Math.round(axis * pxRatio), height * pxRatio);

    axis = height - ((0 - minY) / rangeY) * height;
    ctx.moveTo(0, Math.round(axis * pxRatio));
    ctx.lineTo(height * pxRatio, Math.round(axis * pxRatio));

    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 1 * pxRatio;
    ctx.strokeStyle = '#fff';

    let xStart, yStart, xEnd, yEnd;
    let values = get(this, 'lineValues');

    xStart = ((values[0].x - minX) / rangeX) * width;
    yStart = height - ((values[0].y - minY) / rangeY) * height;

    ctx.moveTo(xStart * pxRatio, yStart * pxRatio);

    for(let i = 1; i < values.length; i++) {
      xEnd = ((values[i].x - minX) / rangeX) * width;
      yEnd = height - ((values[i].y - minY) / rangeY) * height;

      ctx.lineTo(xEnd * pxRatio, yEnd * pxRatio);
    }

    ctx.stroke();

  },

});
