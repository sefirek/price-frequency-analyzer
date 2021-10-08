const { workerData, parentPort } = require('worker_threads');
const fs = require('fs');
const getNextUrl = require('../exchanges/poloniex/getNextUrl');
const loadData = require('../exchanges/poloniex/loadData');

const cwd = process.cwd();
const interval = '5m';
const FIVE_MINUTES_PER_DAY = 12 * 24;
const MAX_SAMPLES_COUNT = 1000;
const TIME_TO_ASK_OFFSET = 60_000;

const { symbol, exchange } = workerData;


/**
 *
 */
async function checkIfDataExists() {
  const lastDate = new Date();
  const url = getNextUrl(symbol, interval, { lastDate });
  const data = await loadData(url);
  return data !== null;
}

parentPort.on('message', (message) => {
  if (message.command === 'can I download data') {
    const parentMessage = {
      type: 'data-exists',
      exchange,
      symbol,
    };
    checkIfDataExists().then((value) => {
      parentPort.postMessage({
        ...parentMessage,
        value,
      });
    }).catch((error) => {
      parentPort.postMessage({
        ...parentMessage,
        error,
      });
    });
    return;
  }

  if (message.command === 'download data') {
    if (!message.value) {
      const fullData = [];
      processData(new Date(), fullData);
    }
    return;
  }

  if (message.command === 'ask for updates') {
    const timeToAsk = 300_000 - (new Date().getTime() % 300_000) + TIME_TO_ASK_OFFSET;
    console.log({ date: message.value, timeToAsk });
    setTimeout(() => updateLoop(message.value), timeToAsk);
  }
});

/**
 * @param lastDate
 * @param fullData
 */
function processData(lastDate, fullData) {
  loadData(getNextUrl(symbol, interval, { lastDate })).then((data) => {
    if (data === null) {
      parentPort.postMessage({
        type: 'loaded-data',
        exchange,
        symbol,
        value: fullData,
      });
      return;
    }
    fullData.push(...data);
    data.forEach(({ time }) => {
      if (lastDate.getTime() > time.getTime()) {
        lastDate.setTime(time.getTime());
      }
    });
    // moze pobierz z data najstarsza date
    lastDate.setMinutes(lastDate.getMinutes());
    processData(lastDate, fullData);
  }).catch((error) => {
    console.log(error);
    console.log('kolejna próba');
    processData(lastDate, fullData);
  });
}

/**
 * @param lastDate
 * @param fullData
 */
function updateLoop(lastDate) {
  console.log('xx', lastDate);
  loadData(getNextUrl(symbol, interval, { firstDate: lastDate })).then((data) => {
    if (!data) throw new Error('Fetch return nothing');
    data.forEach(({ time }) => {
      if (time.getTime() > lastDate.getTime()) {
        lastDate.setTime(time.getTime());
      }
    });
    parentPort.postMessage({
      type: 'new-data-received',
      exchange,
      symbol,
      value: data,
      lastDate,
    });
    const timeToAsk = 300_000 - (new Date().getTime() % 300_000) + TIME_TO_ASK_OFFSET;
    setTimeout(() => updateLoop(lastDate), timeToAsk);
  }).catch((error) => {
    // console.log('loop', { error });
    setTimeout(() => updateLoop(lastDate), 2000);
  });
}


// checkIfDataExists().then(console.log).catch(console.error);
