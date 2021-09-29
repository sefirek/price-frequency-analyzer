
// function BinanceData(){
//   this
// }

/**
 * @param array
 */
function arrayToJSON(array) {
  const json = [];
  array.forEach((record) => {
    const time = new Date();
    time.setTime(record[0]);
    if (!Number.isNaN(time.getTime())) {
      json.push({ time, close: Number.parseFloat(record[4]) });
    }
  });
  return json;
}

module.exports = arrayToJSON;
