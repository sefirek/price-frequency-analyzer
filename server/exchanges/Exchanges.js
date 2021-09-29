const loadBinanceMaxSizeData = require('./binance/loadMaxSizeData');
const loadPoloniexMaxSizeData = require('./poloniex/loadMaxSizeData');

const binanceArrayToJSON = require('./binance/arrayToJSON');
const poloniexArrayToJSON = require('./poloniex/arrayToJSON');

const EXCHANGES = {
  binance: {
    arrayToJSON: binanceArrayToJSON,
    loadMaxSizeData: loadBinanceMaxSizeData.loadMaxSizeData,
    getNextUrl: loadBinanceMaxSizeData.getNextUrl,

  },
  poloniex: {
    arrayToJSON: poloniexArrayToJSON,
    loadMaxSizeData: loadPoloniexMaxSizeData.loadMaxSizeData,
    getNextUrl: loadPoloniexMaxSizeData.getNextUrl,
  },
};

module.exports = EXCHANGES;
