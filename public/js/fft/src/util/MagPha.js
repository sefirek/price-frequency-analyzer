import ComplexArray from '../ComplexArray';

class MagPha {
  constructor(frequency, complexArray) {
    if (!(complexArray instanceof ComplexArray)) throw new Error('Wrong type of a complexArray argument, expected ComplexArray type');
    const { re, im } = complexArray[frequency];
    if (!(im)) {
      return this;
    }
    this.magnitude = Math.sqrt(re * re + im * im);
    this.phase = Math.atan(im / re);
    this.frequency = frequency;
    const size = complexArray.length;
    const halfSize = size / 2;
    if (frequency > size / 2) throw new Error(`Wrong frequency value, frequency = ${frequency}, expected max ${halfSize}`);
    const complexFirst = complexArray[frequency];
    if (frequency !== 0 && frequency !== halfSize) {
      const complexSecond = complexArray[size - frequency];
      this.zero = () => {
        complexFirst.zero();
        complexSecond.zero();
      };
    } else {
      this.zero = () => {
        complexFirst.zero();
      };
    }
  }

  zero() {
    return this;
  }
}

export default MagPha;
