// true modulo operation, unlike javascript's built-in remainder operator
function mod(num, mod) {
  let remain = num % mod;
  return Math.floor(remain >= 0 ? remain : remain + mod);
}

export { mod };
