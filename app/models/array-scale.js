import Ember from 'ember';
import Array from './array';

// a regular array except the currentItem is computed from parent module properties,
// instead of being a saved attribute.

export default Array.extend({
  currentItem: Ember.computed('module.degreeInOctave',function(){
    return this.get('items').findBy('index', this.get('module.degreeInOctave'));
  }),
});
