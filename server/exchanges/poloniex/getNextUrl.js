
module.exports = (symbol, interval, { firstDate, lastDate }) => {
  const MAX_SAMPLE_TIME = 300 * 1000;
  let startTime = null;
  let endTime = null;

  if (firstDate) {
    const time = Math.floor(firstDate.getTime() / 1000 + 300);
    startTime = `&start=${time}`;
    endTime = `&end=${time + MAX_SAMPLE_TIME}`;
  } else {
    const time = Math.floor(lastDate.getTime() / 1000 - 300);
    startTime = `&start=${time - MAX_SAMPLE_TIME}`;
    endTime = `&end=${time}`;
  }
  const url = `https://poloniex.com/public?command=returnChartData&currencyPair=${symbol}${startTime}${endTime}&period=${Number.parseInt(interval, 10) * 60}`;
  console.log({ url });
  return url;
};
