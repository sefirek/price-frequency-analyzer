/* eslint-disable no-bitwise */
function reverseBits(x, bits) {
  let bit = 1;
  let reverse = 0;
  for (let i = 0; i < bits; i += 1) {
    reverse <<= 1;
    reverse += (x & bit) ? 1 : 0;
    bit <<= 1;
  }
  return reverse;
}

export default reverseBits;
