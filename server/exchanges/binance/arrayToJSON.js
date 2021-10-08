
// function BinanceData(){
//   this
// }

/**
 * @param array
 */
function arrayToJSON(array) {
  const json = [];
  array.forEach((record) => {
    if (record[0] % (300)) return;
    const time = new Date();
    time.setTime(record[0]);
    if (!Number.isNaN(time.getTime())) {
      json.push({ time, close: Number.parseFloat(record[4]) });
    }
  });
  return json;
}

module.exports = arrayToJSON;
