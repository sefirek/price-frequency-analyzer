
/**
 *
 */
export default function MA() {
  this.getUpdateDataFunction = (symbol, period) => {
    const array = new Array(period).fill(null);
    return (id, json) => {
      array.push(json[id][symbol]);
      array.shift();
      if (array[0]) {
        let sum = 0;
        array.forEach((element) => {
          sum += element;
        });
        return sum / period;
      }
      return null;
    };
  };
}
