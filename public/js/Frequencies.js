// import {
//   DFT,
//   ComplexArray,
//   utils,
// } from './fft/src/index';
import DFT from './fft/src/DFT';
import ComplexArray from './fft/src/ComplexArray';
import MagPhaArray from './fft/src/util/MagPhaArray';
/**
 *
 */
export default function Frequencies() {
  this.getUpdateDataFunction = (objectPropertyName, samplesCount, frequency) => {
    const dft = new DFT(samplesCount);
    return (id, json) => {
      if (id < samplesCount - 1) return null;
      const closePriceVector = [];
      for (let i = id - samplesCount + 1; i <= id; i += 1) {
        closePriceVector.push(json[i][objectPropertyName]);
      }
      const complexArray = ComplexArray.createFromArray(normalize(closePriceVector));
      const dftResult = dft.calculate(complexArray);

      const magPhaArray = new MagPhaArray(dftResult);
      magPhaArray.deleteAllOthersFrequencies(frequency);
      const x = magPhaArray.getPreparedComplexArray();
      // const idftResult = dft.iCalculate(magPhaArray.getPreparedComplexArray());
      const idftResult = dft.iCalculate(x);
      // dftResult.forEach((complex, index) => {
      //   if (index === 0) return;
      //   const { re, im } = complex;
      //   const tan = Math.tan(im / re);
      //   const radius = Math.min(Math.sqrt(im * im + re * re), 1);
      //   complex.re = radius * Math.sin(tan * Math.PI);
      //   complex.im = radius * Math.cos(tan * Math.PI);
      // });
      return idftResult[samplesCount - 1].re;
      // return ((Math.cos(x[frequency].re) + Math.sin(x[frequency].im)));// - 0.4) / 0.8 * 0.2 + 1.2;
    };
  };
}

/**
 * @param {number[]}array
 */
function normalize(array) {
  let sum = 0;
  array.forEach((x) => { sum += x; });
  const normalized = [];
  sum /= array.length;
  array.forEach(x => normalized.push(x - sum));
  return normalized;
}
