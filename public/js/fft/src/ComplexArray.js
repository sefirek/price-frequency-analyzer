import Complex from './Complex';

/**
 * Tworzy tablicę z argumentami typu Complex
 */
class ComplexArray extends Array {
  /**
   * Jeżeli size > 0, tworzy tablicę n-elementową wypełnioną instancjami klasy Complex
   *
   * @param {number} size rozmiar tablicy
   */
  constructor(size = 0) {
    super();
    if (size < 1) return this;
    for (let i = 0; i < size; i += 1) {
      this.push(new Complex(0, 0));
    }
  }

  /**
   * Umieszcza element w tablicy
   *
   * @param {Complex} complex
   * @returns {ComplexArray} this
   * @throws {Error} niepoprawny typ argumentu
   */
  push(complex) {
    if (!(complex instanceof Complex)) throw new Error('Wrong type of complex argument, expected Complex type');
    super.push(complex);
    return this;
  }

  /**
   * Głęboka kopia
   *
   * @returns {ComplexArray} kopia
   */
  deepCopy() {
    const result = new ComplexArray();
    super.forEach(complex => result.push(complex.copy()));
    return result;
  }

  /**
   * Przepisuje tablicę bez zachowania referencji, głębokie kopiowanie
   *
   * @param {ComplexArray} complexArray tablica do przepisania
   * @returns {ComplexArray} this
   * @throws {Error} Niepoprawny typ argumentu
   * @throws {Error} Niepoprawny rozmiar kopiowanej tablicy
   */
  rewrite(complexArray) {
    if (!(complexArray instanceof ComplexArray)) throw new Error('Argument must be the type of ComplexArray');
    if (this.length !== complexArray.length) throw new Error(`Mismatch of length. Length = ${complexArray.length}, expected ${this.length}.`);
    for (let i = 0; i < this.length; i += 1) {
      this[i].init(complexArray[i]);
    }
    return this;
  }

  /**
   * Ustawia rozmiar tablicy na 0
   *
   * @returns {ComplexArray} this
   */
  clear() {
    super.length = 0;
    return this;
  }

  /**
   * Jeżeli pusta tablica zwraca true
   *
   * @returns {boolean}
   */
  isEmpty() {
    return super.length === 0;
  }
}

/**
 * Tworzy ComplexArray ze zwykłego array
 *
 * @param {Array} array
 * @returns {ComplexArray} complexArray
 * @throws {Error} array nie jest zwykłą tablicą
 */
ComplexArray.createFromArray = (array) => {
  if (!array || array.constructor.name !== 'Array') throw Error('Wrong type of array argument, expected simple Array object.');
  const result = new ComplexArray();
  const l = array.length;
  for (let i = 0; i < l; i += 1) {
    result.push(new Complex(array[i], 0));
  }
  return result;
};

export default ComplexArray;
