import Ember from 'ember';

const {
  Helper
} = Ember;

export default Helper.helper(function([value]) {
  return !value;
});
