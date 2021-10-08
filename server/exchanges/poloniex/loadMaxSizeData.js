const fetch = require('node-fetch');
const poloniexArrayToJSON = require('./arrayToJSON');

let json = [];

/**
 * @param symbol
 * @param interval
 * @param getData
 * @param done
 * @param startDate
 * @param reject
 */
function loadMaxSizeData(getData, done, symbol = 'ETHBTC', interval = '5m', startDate = null, reject) {
  const readingDirection = startDate ? 'forward' : 'backward';
  if (startDate !== null) {
    json = [{ time: startDate }];
  }
  let id = 0;
  let timeoutId = null;
  /**
   *
   */
  function loadData() {
    id += 1;
    console.log(`start id=${id}`);
    fetch(getNextUrl(symbol, interval, readingDirection))
      .then(res => res.json())
      .then((data) => {
        console.log({ dataLength: data.length });
        if (data.length === 1 && data[0].date === 0) {
          console.log('done');
          done();
          return;
        }
        if (!Array.isArray(data)) {
          reject(data);
          clearTimeout(timeoutId);
          return;
        }
        json = poloniexArrayToJSON(data);

        console.log(`stop id=${id} size=${json.length}`);
        getData(json);
        timeoutId = setTimeout(loadData, 0);
      });
  }
  loadData();
}

/**
 * @param symbol
 * @param interval
 * @param readingDirection
 */
function getNextUrl(symbol, interval, readingDirection = 'backward') {
  let t = null;
  const MAX_SAMPLE_TIME = 300 * 1000;
  let startTime = null;
  let endTime = null;
  if (readingDirection === 'forward') {
    if (json.length > 0) {
      let max = new Date(0);
      json.forEach((record) => {
        if (max.getTime() < record.time.getTime()) {
          max = record.time;
        }
      });
      t = Math.floor(max.getTime() / 1000) + 1;
    } else {
      t = Math.floor(Date.now() / 1000);
    }
    startTime = `&start=${t}`;
    endTime = `&end=${t + MAX_SAMPLE_TIME}`;
  } else {
    if (json.length > 0) {
      let min = new Date();
      json.forEach((record) => {
        if (min.getTime() > record.time.getTime()) {
          min = record.time;
        }
      });
      t = Math.floor(min.getTime() / 1000) - 1;
    } else {
      t = Math.floor(Date.now() / 1000);
    }
    startTime = `&start=${t - MAX_SAMPLE_TIME}`;
    endTime = `&end=${t}`;
  }
  const symbolName = symbol;
  const url = `https://poloniex.com/public?command=returnChartData&currencyPair=${symbolName}${startTime}${endTime}&period=${Number.parseInt(interval, 10) * 60}`;
  console.log({ url });
  return url;
}

module.exports = {
  loadMaxSizeData,
  getNextUrl,
};
