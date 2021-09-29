/**
 * @param {string} symbol
 * @param {(data)=>void}callback
 */
function BinanceFetchInterface(symbol, callback) {
  this.symbol = symbol;
  this.callback = callback;
}

module.exports = BinanceFetchInterface;
