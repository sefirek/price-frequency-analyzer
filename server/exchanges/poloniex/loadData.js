const fetch = require('node-fetch');
const arrayToJSON = require('./arrayToJSON');

let id = 0;
/**
 * @param url
 */
function loadData(url) {
  return new Promise((resolve, reject) => {
    id += 1;
    console.log(`start id=${id}`);
    fetch(url)
      .then(res => res.json())
      .then((data) => {
        console.log({ dataLength: data.length });
        if (data === undefined || data.length === undefined) {
          return reject(data);
        }
        if (data[0].date === 0) {
          console.log('Brak danych');
          return resolve(null);
        }
        if (!Array.isArray(data)) {
          return reject(data);
        }
        console.log(`end id=${id}`);
        return resolve(arrayToJSON(data));
      });
  });
}

module.exports = loadData;
