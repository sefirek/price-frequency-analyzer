/* eslint-disable no-restricted-properties */
import MiniDFT from './MiniDFT';

import ComplexArray from './ComplexArray';

class DFT {
  constructor(inputSize) {
    if (Number.isNaN(Number.parseInt(inputSize, 10))) throw new Error('Wrong inputSize argument, expected Number type.');
    if (Math.pow(2, Math.floor(Math.log2(inputSize))) !== inputSize) throw new Error('Wrong value of inputSize argument, expected value power of 2.');
    this.N = inputSize;
    const N = inputSize;
    const bits = Math.log2(N);
    const calcArrays = [];
    this.input = new ComplexArray(N);
    this.output = new ComplexArray(N);
    calcArrays.push(this.input);
    for (let i = 1; i < bits; i += 1) calcArrays.push(new ComplexArray(N));
    calcArrays.push(this.output);
    this.DFTLevels = [];
    for (let level = 0; level < bits; level += 1) {
      const DFTLevel = [];
      const input = calcArrays[level];
      const output = calcArrays[level + 1];
      for (let n = 0; n < N / 2; n += 1) {
        const miniDFT = new MiniDFT(input, output, level, n);
        DFTLevel.push(miniDFT);
      }
      this.DFTLevels.push(DFTLevel);
    }
  }

  calculate(complexArray) {
    this.input.rewrite(complexArray);
    this.DFTLevels.forEach((DFTLevel) => {
      DFTLevel.forEach((miniDFT) => {
        miniDFT.calc();
      });
    });
    return this.output.deepCopy();
  }

  iCalculate(complexArray) {
    this.input.rewrite(complexArray);
    this.DFTLevels.forEach((DFTLevel) => {
      DFTLevel.forEach((miniDFT) => {
        miniDFT.iCalc();
      });
    });
    const scale = 1 / this.N;
    this.output.forEach((complex) => {
      complex.multiply(scale);
    });
    return this.output.deepCopy();
  }
}

export default DFT;
