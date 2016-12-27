import Ember from 'ember';

const {
  Helper
} = Ember;

export default Helper.helper(function([leftSide, rightSide]) {
  return leftSide === rightSide;
});