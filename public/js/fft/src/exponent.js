import Complex from './Complex';

const mapExponent = [];
const m2PI = -2 * Math.PI;


function exponent(k, N) {
  mapExponent[N] = mapExponent[N] || [];
  let result = mapExponent[N][k];
  if (result) return result;
  const x = m2PI * k / N;
  result = new Complex(Math.cos(x), Math.sin(x));
  mapExponent[N][k] = result;
  return result;
}

export default exponent;
