
/**
 * @param {number} startMoney
 */
export default function TestWallet(startMoney) {
  let wallet = startMoney;
  let currencyWallet = 0;
  let status = 'nothing';
  let tradesCount = 0;
  let tradePrice = 0;
  const history = [];

  this.buy = (price) => {
    if (status === 'buy') return false;
    if (wallet <= 0) return false;
    if (!Number.isFinite(price.close)) throw new Error('Cena nie jest liczba');

    tradePrice = price.close;
    if (wallet > startMoney) {
      currencyWallet = startMoney / price.close;
      wallet -= startMoney;
    } else {
      currencyWallet = wallet / price.close;
      wallet = 0;
    }
    tradesCount += 1;
    status = 'buy';
    history.push(`buy ${price.close}`);
    return true;
    // console.log(`${this.toString()} ${price.time}`);
  };

  this.sell = (price) => {
    if (status === 'sell') return false;
    if (currencyWallet <= 0) return false;
    if (!Number.isFinite(price.close)) throw new Error('Cena nie jest liczba');
    tradePrice = price.close;
    wallet = currencyWallet * price.close;
    currencyWallet = 0;
    tradesCount += 1;
    status = 'sell';
    history.push(`sell ${price.close}`);
    return true;
    // console.log(`${this.toString()} ${price.time}`);
  };
  this.getTransactionStatus = () => status;
  this.reset = () => {
    history.splice(0);
    status = 'nothing';
    wallet = startMoney;
    currencyWallet = 0;
    tradesCount = 0;
    tradePrice = 0;
  };
  this.toString = () => {
    if (wallet === startMoney && history.length > 0) {
      console.log({ history });
      throw new Error('Błąd działania portfela');
    }
    return JSON.stringify({
      wallet,
      currencyWallet,
      tradesCount,
      history,
    });
  };
  this.getBalance = (price) => {
    if (wallet) return wallet;
    return currencyWallet * price.close;
  };
  this.getTradePrice = () => tradePrice;
  this.getPercentageEarnings = (price) => {
    if (status === 'buy') return price.close / tradePrice;
    return tradePrice / price.close;
  };
}
