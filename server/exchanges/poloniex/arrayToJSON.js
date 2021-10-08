/**
 * @param array
 */
function arrayToJSON(array) {
  const json = [];
  array.forEach((record) => {
    if (record.date % (300)) return;
    const time = new Date();
    time.setTime(record.date * 1000);
    if (!Number.isNaN(time.getTime())) {
      json.push({
        time,
        open: Number.parseFloat(record.open),
        high: Number.parseFloat(record.high),
        low: Number.parseFloat(record.low),
        close: Number.parseFloat(record.close),
      });
    }
  });
  return json;
}

module.exports = arrayToJSON;
