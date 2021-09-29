const fetch = require('node-fetch');
const binanceArrayToJSON = require('./arrayToJSON');

let json = [];

/**
 * @param symbol
 * @param interval
 * @param getData
 * @param done
 * @param startDate
 */
function loadMaxSizeData(getData, done, symbol = 'ETHBTC', interval = '5m', startDate = null) {
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
      fetch(getNextUrl(symbol, interval, startDate))
        .then(res => res.json())
        .then((data) => {
          console.log(data.length);
          if (data.length === 0) {
            json = [];
            done();
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
 * @param startDate
 */
function getNextUrl(symbol, interval, startDate = null) {
  let startTime = '';
  if (startDate) {
    startTime = `&startTime=${startDate.getTime()}`;
  }

  let endTime = '';
  if (json.length) {
    let t = json[0].time.getTime() - 1;
    json.forEach((record) => {
      const currentTime = record.time.getTime();
      if (t < currentTime) {
        t = currentTime;
      }
    });
    endTime = `&endTime=${t}`;
  }

  return `https://www.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000${startTime}${endTime}`;
}

module.exports = {
  loadMaxSizeData,
  getNextUrl,
};
