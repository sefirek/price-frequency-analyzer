const BinanceFetchInterface = require('./BinanceFetchInterface');

class BinanceFetchLoop extends Array {
  constructor(interval) {
    super();
    this.interval = interval;
  }

  startLoop(){
    this.fetchAll();
    this.intervalId = setInterval(this.fetchAll, this.interval)
  }

  stopLoop(){
    clearInterval(this.intervalId);
  }

  /**
   *
   * @param {BinanceFetchInterface} binanceFetchObject
   * @param {{}} urlOptions
   * @returns {Promise<JSON|void>}
   */
  fetch(binanceFetchObject, urlOptions={}) {
    const { symbol, callback } = binanceFetchObject;
    const url = getKlinesUrl(symbol, this.interval, urlOptions);
    return this.fetch(url)
      .then(res => res.json())
      .then(callback);
  }

  /**
   * 
   * @returns {Promise}
   */
  fetchAll() {
    const promises = [];
    this.forEach((binanceFetchObject) => {
      promises.push(this.fetch(binanceFetchObject));
    });
    return Promise.all(promises);
  }

  push(binanceFetchObject) {
    return super.push(binanceFetchObject);
  }
}

/**
 * @param {string} symbol
 * @param {string} interval
 * @param {{}} options
 * @returns {string} url
 */
function getKlinesUrl(symbol, interval, options = {limit=1000}) {
  let url = `https://www.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`;
  Object.keys(options).forEach((key) => {
    url += `&${key}=${options[key]}`;
  });
  return url;
}

module.exports = BinanceFetchLoop;
