/* eslint-disable no-param-reassign */
/**
 * Liczba zespolona
 */
class Complex {
  /**
   * Tworzy połączenie części rzeczywistej i urojonej
   * @param {Number} re część rzeczywista
   * @param {Number} im część urojona
   */
  constructor(re = 0, im = 0) {
    if (typeof re !== 'number' || typeof im !== 'number') {
      throw new Error(`Wrong type of argument, re:${typeof re}, im:${typeof im}, expected re:Number, im:Number`);
    }
    this.re = re;
    this.im = im;
  }

  /**
   * Mnożenie przez liczbę rzeczywistą
   * @param {Number} x
   * @returns {Complex} this
   */
  multiply(x) {
    this.re *= x;
    this.im *= x;
    return this;
  }

  /**
   * Sprzężenie liczby zespolonej
   * @returns {Complex} this
   */
  conjugate() {
    this.im = -this.im;
    return this;
  }

  /**
   * Przepisanie zawartości other do this
   * @param {Complex} other
   * @returns {Complex} this
   */
  init(other) {
    this.re = other.re;
    this.im = other.im;
    return this;
  }

  /**
   * Dodawanie liczb zespolonych
   * @param {Complex} other
   * @returns {Complex} this
   */
  add(other) {
    this.re = this.re + other.re;
    this.im = this.im + other.im;
    return this;
  }

  /**
   * Odejmowanie liczb zespolonych
   * @param {Complex} other
   * @returns {Complex} this
   */
  sub(other) {
    this.re = this.re - other.re;
    this.im = this.im - other.im;
    return this;
  }

  /**
   * Mnożenie liczb zespolonych
   * @param {Complex} other
   * @returns {Complex} this
   */
  mul(other) {
    const r = this.re * other.re - this.im * other.im;
    this.im = this.re * other.im + this.im * other.re;
    this.re = r;
    return this;
  }

  /**
   * Dodawanie liczb zespolonych
   * output = this + other
   * @param {Complex} other
   * @param {Complex} output
   * @returns {Complex} output
   */
  staticAdd(other, output) {
    output.re = this.re + other.re;
    output.im = this.im + other.im;
    return output;
  }

  /**
   * Odejmowanie liczb zespolonych
   * output = this - other
   * @param {Complex} other
   * @param {Complex} output
   * @returns {Complex} output
   */
  staticSub(other, output) {
    output.re = this.re - other.re;
    output.im = this.im - other.im;
    return output;
  }

  /**
   * Mnożenie liczb zespolonych
   * output = this * other
   * @param {Complex} other
   * @param {Complex} output
   * @returns {Complex} output
   */
  staticMul(other, output) {
    output.re = this.re * other.re - this.im * other.im;
    output.im = this.re * other.im + this.im * other.re;
    return output;
  }

  /**
   * Odpowiednik Math.exp dla liczb zespolonych
   * @returns {Complex} this
   */
  cexp() {
    const er = Math.exp(this.re);
    this.re = er * Math.cos(this.im);
    this.im = er * Math.sin(this.im);
    return this;
  }

  /**
   * Zeruje liczbę zespoloną
   * @returns {Complex} this
   */
  zero() {
    this.re = 0;
    this.im = 0;
    return this;
  }

  /**
   * Głęboka kopia
   * @returns {Complex} kopia
   */
  copy() {
    return new Complex(this.re, this.im);
  }
}

export default Complex;
