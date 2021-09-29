
/**
 * @param {{close:number}[]} prices
 * @param {{inputSize:number, outputSize:number, period:number}} options
 */
export default function createSeriesUpsAndDownsDataSet(prices,
  { inputSize, outputSize, period }) {
  const result = [];
  let index = (prices.length % period) + period;
  while (index < prices.length) {
    // if(period)
    const input = createSeriesUpsAndDowns(prices, index - period, inputSize, period);
    const output = createSeriesUpsAndDowns(prices, index, outputSize, period);
    result.push({ input, output, price: prices[index + period - 1] });
    index += period;
  }
  return result;
}

/**
 * @param {{close:number}[]} prices
 * @param {number} index
 * @param {number} size
 * @param {number} period
 * @param {number[]} expectedPercentage
 */
export function createSeriesUpsAndDowns(prices, index, size, period, expectedPercentage = 0.05) {
  if (period % size) throw new Error(`Size musi być dzielnikiem period. size=${size} period=${period}`);
  const result = [];
  const pricesPart = prices.slice(index, index + period);
  if (pricesPart.length < period) {
    console.error({ pricesPart, pricesPartLength: pricesPart.length });
    console.log({ index, endIndex: index + period });
    throw new Error('Incorrect pricesPart.length');
  }
  const openPrice = pricesPart[0].close;
  const sizeOfPeriodPart = period / size;
  for (let i = 0; i < size; i += 1) {
    const pricesSubPart = pricesPart.slice(i * sizeOfPeriodPart, (i + 1) * sizeOfPeriodPart).map(price => price.close);
    const min = Math.min(...pricesSubPart);
    const max = Math.max(...pricesSubPart);

    if (max - openPrice > openPrice - min) {
      result.push(Math.tanh((max / openPrice - 1) / expectedPercentage));
    } else {
      result.push(-Math.tanh((openPrice / min - 1) / expectedPercentage));
    }
  }
  return result;
}
