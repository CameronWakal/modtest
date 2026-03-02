import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

// Native range slider component - replaces jQuery rangeslider.js
// Renders same DOM structure for CSS compatibility

export default class RangeSliderComponent extends Component {
  @tracked isDragging = false;

  get min() {
    return this.args.min ?? 0;
  }

  get max() {
    return this.args.max ?? 100;
  }

  get step() {
    return this.args.step ?? 1;
  }

  get value() {
    return this.args.value;
  }

  get orientation() {
    return this.args.orientation ?? 'vertical';
  }

  get orientationClass() {
    return this.orientation === 'vertical' ? 'rangeslider-vertical' : 'rangeslider-horizontal';
  }

  get handleStyle() {
    if (this.value == null) {
      return htmlSafe('');
    }
    const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
    if (this.orientation === 'vertical') {
      // Vertical: bottom position (0% = bottom, 100% = top)
      return htmlSafe(`bottom: ${percent}%;`);
    } else {
      // Horizontal: left position
      return htmlSafe(`left: ${percent}%;`);
    }
  }

  get fillStyle() {
    if (this.value == null) {
      return htmlSafe('');
    }
    const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
    if (this.orientation === 'vertical') {
      return htmlSafe(`height: ${percent}%;`);
    } else {
      return htmlSafe(`width: ${percent}%;`);
    }
  }

  @action
  onMouseDown(event) {
    event.preventDefault();
    this.isDragging = true;
    this._sliderElement = event.currentTarget.closest('.rangeslider');
    this._updateValueFromEvent(event);

    // Add document-level listeners for drag
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('touchmove', this._onMouseMove, { passive: false });
    document.addEventListener('touchend', this._onMouseUp);
  }

  @action
  onTouchStart(event) {
    event.preventDefault();
    this.isDragging = true;
    this._sliderElement = event.currentTarget.closest('.rangeslider');
    this._updateValueFromEvent(event.touches[0]);

    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('touchmove', this._onMouseMove, { passive: false });
    document.addEventListener('touchend', this._onMouseUp);
  }

  _onMouseMove = (event) => {
    if (!this.isDragging) return;
    event.preventDefault();
    const touch = event.touches ? event.touches[0] : event;
    this._updateValueFromEvent(touch);
  };

  _onMouseUp = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('touchmove', this._onMouseMove);
    document.removeEventListener('touchend', this._onMouseUp);
  };

  _updateValueFromEvent(event) {
    if (!this._sliderElement) return;

    const rect = this._sliderElement.getBoundingClientRect();
    let percent;

    if (this.orientation === 'vertical') {
      // Vertical: calculate from bottom
      const y = event.clientY - rect.top;
      percent = 1 - (y / rect.height);
    } else {
      // Horizontal: calculate from left
      const x = event.clientX - rect.left;
      percent = x / rect.width;
    }

    // Clamp percent to 0-1
    percent = Math.max(0, Math.min(1, percent));

    // Calculate value
    let newValue = this.min + (percent * (this.max - this.min));

    // Apply step
    if (this.step > 0) {
      newValue = Math.round(newValue / this.step) * this.step;
    }

    // Clamp to min/max
    newValue = Math.max(this.min, Math.min(this.max, newValue));

    // Notify parent
    if (this.args.onChange) {
      this.args.onChange(newValue);
    }
  }

  willDestroy() {
    super.willDestroy();
    // Clean up any lingering event listeners
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('touchmove', this._onMouseMove);
    document.removeEventListener('touchend', this._onMouseUp);
  }
}
