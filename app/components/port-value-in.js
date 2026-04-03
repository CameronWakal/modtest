import PortComponent from './port';

export default class PortValueInComponent extends PortComponent {
  get portTypeClasses() {
    return 'port-value-in port-value port-in';
  }
}
