const fetch = require('node-fetch');
const binanceArrayToJSON = require('./arrayToJSON');

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
  let next = true;
  const intervalId = setInterval(() => {
    if (next) {
      next = false;
      id += 1;
      console.log(`start id=${id}`);
      fetch(getNextUrl(symbol, interval, readingDirection))
        .then(res => res.json())
        .then((data) => {
          console.log({ data });
          console.log({ dataLength: data.length });
          if (data.length === 0) {
            console.log('done');
            done();
            return;
          }
          if (!Array.isArray(data)) {
            reject(data);
            clearInterval(intervalId);
            return;
          }
          json = binanceArrayToJSON(data);
          // console.log(jsonData.length);

          console.log(`stop id=${id} size=${json.length}`);
          // loadMaxSizeData(symbol, interval);
          getData(json);
          next = true;
        });
    }
  }, 0);
}

/**
 * @param symbol
 * @param interval
 * @param readingDirection
 * @param startDate
 */
function getNextUrl(symbol, interval, readingDirection = 'backward') {
  if (symbol.length !== 7 && symbol.length !== 8) throw new Error('Nie wiem jak rozdzielic pary dla dlugosci!==3');

  let t = null;
  const MAX_SAMPLE_TIME = 300 * 1000 * 1000;
  let startTime = '';
  let endTime = '';
  if (readingDirection === 'forward') {
    if (json.length > 0) {
      let max = new Date(0);
      json.forEach((record) => {
        console.log({ record });
        if (max.getTime() < record.time.getTime()) {
          max = record.time;
        }
      });
      t = Math.floor(max.getTime()) + 1;
    } else {
      t = Date.now();
    }
    startTime = `&startTime=${t}`;
    endTime = `&endTime=${t + MAX_SAMPLE_TIME}`;
  } else {
    if (json.length > 0) {
      let min = new Date();
      json.forEach((record) => {
        if (min.getTime() > record.time.getTime()) {
          min = record.time;
        }
      });
      t = min.getTime() - 1;
    } else {
      t = Date.now();
    }
    startTime = `&start=${t - MAX_SAMPLE_TIME}`;
    endTime = `&end=${t}`;
  }


  const url = `https://www.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000${startTime}${endTime}`;
  console.log({ url });
  return url;
}

module.exports = {
  loadMaxSizeData,
  getNextUrl,
};
