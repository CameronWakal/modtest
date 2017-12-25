// true modulo operation, unlike javascript's built-in remainder operator
function mod(num, mod) {
  let remain = num % mod;
  return Math.floor(remain >= 0 ? remain : remain + mod);
}

// integer division
function div(num, denom) {
  return Math[num > 0 ? 'floor' : 'ceil'](num / denom);
}

export { mod, div };
