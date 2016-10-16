import Module from '../module/model';

export default Module.extend({
  
  type: 'module-switch', //modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
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
    this.addValueInPort('in0', 'in0Port', true);
    this.addValueInPort('in1', 'in1Port', true);
    this.addValueInPort('switch', 'switchInPort', true);
    this.addValueOutPort('out', 'getValue', true);
    this.saveLater();
  },

});
