import Helper from '@ember/component/helper';

export default Helper.helper(function([leftSide, rightSide]) {
  return leftSide === rightSide;
});