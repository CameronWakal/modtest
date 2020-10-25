import Component from '@ember/component';
import { run } from '@ember/runloop';
import { htmlSafe } from '@ember/string';
import { computed, get, observer } from '@ember/object';

export default Component.extend({
  classNames: ['graph-canvas'],
  tagName: 'canvas',
  attributeBindings: ['inlineStyles:style'],

  width: computed('xMin', 'xMax', 'xScale', function() {
    return (this.xMax - this.xMin) * this.xScale;
  }),
  height: computed('yMin', 'yMax', 'yScale', function() {
    return (this.yMax - this.yMin) * this.yScale;
  }),

  inlineStyles: computed('width', 'height', function() {
    let styleString = `width:${this.width}px; height:${this.height}px`;
    return htmlSafe(styleString);
  }),

  onValuesChanged: observer(
    'lineValues.[]',
    'triangesValues.[]',
    'xMin',
    'xMax',
    'yMin',
    'yMax',
    'xScale',
    'yScale',
    function() {
      run.once(this, 'draw');
    }
  ),

  // draw connections between ports,
  // draw line from new connection port to cursor position
  draw() {

    let ctx = this.element.getContext('2d');
    let pxRatio = window.devicePixelRatio;
    let width = this.width;
    let height = this.height;
    let minX = this.xMin * 1000;
    let maxX = this.xMax * 1000;
    let minY = this.yMin * 1000;
    let maxY = this.yMax * 1000;
    ctx.canvas.width  = width * pxRatio;
    ctx.canvas.height = height * pxRatio;
    ctx.lineWidth = 1 * pxRatio;
    ctx.strokeStyle = 'rgba(44, 49, 58, 0.8)';
    ctx.beginPath();

    let rangeX = maxX - minX;
    let rangeY = maxY - minY;

    // draw axis
    let axis = ((0 - minX) / rangeX) * width;
    ctx.moveTo(Math.round(axis * pxRatio), 0);
    ctx.lineTo(Math.round(axis * pxRatio), height * pxRatio);

    axis = height - ((0 - minY) / rangeY) * height;
    ctx.moveTo(0, Math.round(axis * pxRatio));
    ctx.lineTo(height * pxRatio, Math.round(axis * pxRatio));

    // draw white spiral line
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 1 * pxRatio;
    ctx.strokeStyle = '#fff';

    let xStart, yStart, xEnd, yEnd;
    let values = this.lineValues;

    xStart = ((values[0].x - minX) / rangeX) * width;
    yStart = height - ((values[0].y - minY) / rangeY) * height;

    ctx.moveTo(xStart * pxRatio, yStart * pxRatio);

    for (let i = 1; i < values.length; i++) {
      xEnd = ((values[i].x - minX) / rangeX) * width;
      yEnd = height - ((values[i].y - minY) / rangeY) * height;

      ctx.lineTo(xEnd * pxRatio, yEnd * pxRatio);
    }

    ctx.stroke();

    // draw triangles
    ctx.lineWidth = 1 * pxRatio;
    ctx.strokeStyle = 'rgba(127,127,127,0.5)';
    values = this.trianglesValues;
    // loop draws one triangle with CE dot
    for (let i = 0; i < values.length / 4; i++) {
      ctx.beginPath();
      xStart = ((values[i * 4].x - minX) / rangeX) * width;
      yStart = height - ((values[i * 4].y - minY) / rangeY) * height;
      ctx.moveTo(xStart * pxRatio, yStart * pxRatio);
      xEnd = ((values[i * 4 + 1].x - minX) / rangeX) * width;
      yEnd = height - ((values[i * 4 + 1].y - minY) / rangeY) * height;
      ctx.lineTo(xEnd * pxRatio, yEnd * pxRatio);
      xEnd = ((values[i * 4 + 2].x - minX) / rangeX) * width;
      yEnd = height - ((values[i * 4 + 2].y - minY) / rangeY) * height;
      ctx.lineTo(xEnd * pxRatio, yEnd * pxRatio);
      ctx.lineTo(xStart * pxRatio, yStart * pxRatio);
      xStart = ((values[i * 4 + 3].x - minX) / rangeX) * width;
      yStart = height - ((values[i * 4 + 3].y - minY) / rangeY) * height;
      ctx.fillStyle = 'rgba(127, 127, 127, 0.3)';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(127, 127, 127, 1)';
      ctx.fillRect((xStart - 1) * pxRatio, (yStart - 1) * pxRatio, pxRatio * 3, pxRatio * 3);
    }
  }
});
