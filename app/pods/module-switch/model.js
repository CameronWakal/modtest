import Module from '../module/model';

export default Module.extend({
  
  label: 'Switch', 

  getValue() {
    let switchVal = this.get('switchInPort').getValue();
    if(switchVal === 0){
      return this.get('in0Port').getValue();
    } else if(switchVal === 1){
      return this.get('in1Port').getValue();
    } else {
      return null;
    }
  },

  didCreate() {
    //create ports
    this.addValueInPort('in0', 'in0Port');
    this.addValueInPort('in1', 'in1Port');
    this.addValueInPort('switch', 'switchInPort');
    this.addValueOutPort('out', 'getValue');
  },

});
