import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { schedule } from '@ember/runloop';
import { htmlSafe } from '@ember/template';

export default class IndicatorBlinkingComponent extends Component {
  @tracked countIsEven = true;

  get blinkDuration() {
    return this.args.blinkDuration ?? 200;
  }

  get animationClass() {
    if (this.args.blinkTrigger) {
      return this.countIsEven ? 'on-even' : 'on-odd';
    }
    return '';
  }

  get styleAttribute() {
    return htmlSafe(`animation-duration: ${this.blinkDuration}ms;`);
  }

  @action
  onBlinkTriggerChange() {
    // Schedule state update after render to avoid updating during computation
    schedule('afterRender', this, () => {
      this.countIsEven = !this.countIsEven;
    });
  }
}
