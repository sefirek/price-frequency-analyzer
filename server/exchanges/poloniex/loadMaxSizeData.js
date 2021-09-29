const fetch = require('node-fetch');
const poloniexArrayToJSON = require('./arrayToJSON');

let json = [];

/**
 * @param symbol
 * @param interval
 * @param getData
 * @param done
 * @param startDate
 */
function loadMaxSizeData(getData, done, symbol = 'ETHBTC', interval = '5m', startDate = null) {
  const readingDirection = startDate ? 'forward' : 'backward';
  if (startDate !== null) {
    json = [{ time: startDate }];
  }
  let id = 0;
  let next = true;
  setInterval(() => {
    if (next) {
      next = false;
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
          json = poloniexArrayToJSON(data);
          // if (json.filter(record => record.time.getTime() > new Date('Tue Sep 28 2021 18:45:00 GMT+0200 (GMT+02:00)').getTime())) {
          //   throw new Error('sa nowsze rekordy');
          // }
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
 */
function getNextUrl(symbol, interval, readingDirection = 'backward') {
  if (symbol.length !== 7 && symbol.length !== 8) throw new Error('Nie wiem jak rozdzielic pary dla dlugosci!==3');

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
  let symbolName = null;
  if (symbol.length === 7) {
    symbolName = [symbol.substring(3), symbol.substring(0, 3)].join('_');
  } else if (symbol.length === 8) {
    symbolName = [symbol.substring(4), symbol.substring(0, 4)].join('_');
  }

  const url = `https://poloniex.com/public?command=returnChartData&currencyPair=${symbolName}${startTime}${endTime}&period=${Number.parseInt(interval, 10) * 60}`;
  return url;
}

module.exports = {
  loadMaxSizeData,
  getNextUrl,
};
