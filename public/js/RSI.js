
/**
 *
 */
export default function RSI() {
  this.getUpdateDataFunction = (period) => {
    const array = new Array(period).fill(null);
    let lastClose = null;
    return (id, json) => {
      if (lastClose) {
        const sub = json[id].close - lastClose;
        array.push({
          gains: sub > 0 ? sub : 0,
          losses: sub < 0 ? -sub : 0,
        });
        array.shift();
      }
      lastClose = json[id].close;
      if (array[0]) {
        let losses = 0;
        let gains = 0;
        array.forEach((data) => {
          losses += data.losses;
          gains += data.gains;
        });
        losses /= period;
        gains /= period;
        const relativeStrength = gains / losses;
        const rsi = 1 - 1 / (1 + relativeStrength);
        return rsi;
      }
      return null;
    };
  };
}
