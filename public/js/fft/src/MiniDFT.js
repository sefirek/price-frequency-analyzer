/* eslint-disable no-restricted-properties */
import exponent from './exponent';

import reverseBits from './reverseBits';
import ComplexArray from './ComplexArray';
/**
 * Konstruktor łączy w pary 2 wejścia z 2 wyjściami.
 * Przy parametrze level = 0, następuje odwrócenie kolejności bitów
 * do oblicznia identyfikatorów par argumentów
 * (zastępuje rekurencyjną metodę motylkową). Ilość obiektów MiniDFT
 * w ciągu przetwarzającym weście powinna być o rozmiarze 2 razy mniejszym niż rozmiar ciągu
 * wejściowego.
 */
class MiniDFT {
  /**
   * @param {ComplexArray} input ciąg wejściowy
   * @param {ComplexArray} output ciąg wyjściowy
   * @param {Number} level poziom zagłębienia algorytmu. Kroki kolejno 0..<log2(N), gdzie N to
   * rozmiar ciągu wejściowego
   * @param {Number} n krotność poziomu iteracji. Kroki kolejno 0..<N/2, gdzie N to rozmiar
   * ciągu wejściowego
   */
  constructor(input, output, level = 0, n = 0) {
    if (!(input instanceof ComplexArray)) throw new Error('Wrong type of input parameter, expected ComplexArray instance.');
    if (!(output instanceof ComplexArray)) throw new Error('Wrong type of output parameter, expected ComplexArray instance.');
    // Po ile sa grupowane argumenty
    const step = Math.pow(2, level);
    // Wysokosc bloku
    const height = step * 2;
    // Ilość całych bloków nad podanym
    const floors = Math.floor(n / step);
    // Pozycja wzgledem bloku
    const landing = n % step;
    // Pozycja argumentu w bloku
    let id1 = floors * height + landing;
    // Pozycja przeciwległego elementu w bloku
    let id2 = id1 + step;
    this.evenOutput = output[id1];
    this.oddOutput = output[id2];

    if (level === 0) {
      const bits = Math.log2(input.length);
      id1 = reverseBits(id1, bits);
      id2 = reverseBits(id2, bits);
    }
    this.evenInput = input[id1];
    this.oddInput = input[id2];

    this.speed = exponent(landing, height);
    this.inverseSpeed = exponent(-landing, height);
    //console.log(`level = ${level}, n = ${n} : k/N = ${landing}/${height}`);
  }

  /**
   * Wykonuje transformatę danych weściowych i umieszcza je na wyjściu
   */
  calc() {
    const {
      oddInput, oddOutput, evenInput, evenOutput, speed,
    } = this;
    // b[0] = a[1] * w
    oddInput.staticMul(speed, evenOutput);
    // b[1] = a[0] - b[0] = a[0] - a[1] * w
    evenInput.staticSub(evenOutput, oddOutput);
    // b[0] = b[0] + a[0] = a[0] + a[1] * w
    evenOutput.add(evenInput);
  }

  /**
   * Wykonuje transformatę danych weściowych i umieszcza je na wyjściu
   */
  iCalc() {
    const {
      oddInput, oddOutput, evenInput, evenOutput, inverseSpeed,
    } = this;
    // b[0] = a[1] * w
    oddInput.staticMul(inverseSpeed, evenOutput);
    // b[1] = a[0] - b[0] = a[0] - a[1] * w
    evenInput.staticSub(evenOutput, oddOutput);
    // b[0] = b[0] + a[0] = a[0] + a[1] * w
    evenOutput.add(evenInput);
  }
}

export default MiniDFT;
