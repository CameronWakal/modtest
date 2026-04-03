import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentPatchService extends Service {
  @tracked patch = null;
}
