const { Worker } = require('worker_threads');

const db = require('./DatabaseManager');

const downloadWorkers = {};


/**
 *
 */
function getWorkerName({ exchange, symbol }) {
  return `${exchange}__${symbol}`;
}

/**
 *
 */
function getWorker({ exchange, symbol }) {
  const workerName = getWorkerName({ exchange, symbol });
  return downloadWorkers[workerName];
}

/**
 *
 */
function terminateWorker({ exchange, symbol }) {
  const workerName = getWorkerName({ exchange, symbol });
  getWorker({ exchange, symbol }).worker.terminate();
  delete downloadWorkers[workerName];
  console.log(`terminate worker: ${workerName}`);
}

/**
 *
 */
function createWorker({ exchange, symbol }) {
  const newWorker = new Worker(`${__dirname}/DownloadWorker.js`, {
    workerData: {
      symbol,
      exchange,
    },
  });
  return newWorker;
}


/**
 * @param exchange
 * @param symbol
 * @param socketRoom
 */
async function initWorker({ exchange = 'poloniex', symbol = 'USDT_TRX' }, socketRoom) {
  const worker = createWorker({ exchange, symbol });
  downloadWorkers[getWorkerName({ exchange, symbol })] = {
    worker,
    socketRoom,
  };
  worker.on('message', onMessage);
  worker.on('error', (error) => {
    console.error(error);
  });
  const isTableExists = await db.isTableExists(exchange, symbol);
  if (isTableExists) {
    const lastDate = await db.getLastDate({ exchange, symbol });
    worker.postMessage({
      command: 'ask for updates',
      value: lastDate,
    });
    return;
  }
  worker.postMessage({ command: 'can I download data' });
}

/**
 * @param message
 */
async function onMessage(message) {
  console.log({ message });
  if (message.type === 'data-exists') {
    const { worker, socketRoom } = getWorker(message);
    if (message.value === true) {
      await db.createTableIfNotExists(message);
      const lastDate = await db.getLastDate(message);
      worker.postMessage({
        command: 'download data',
        value: lastDate,
      });
      return;
    }
    if (message.value === false) {
      socketRoom.emit('generateDatabase', { message: 'no-data-to-download' });
      terminateWorker(message);
      return;
    }
    socketRoom.emit('generateDatabase', { error: 'incorrect-symbol' });
    terminateWorker(message);
    return;
  }

  if (message.type === 'loaded-data') {
    const { worker, socketRoom } = getWorker(message);
    db.update(message).then(async () => {
      console.log('data saved');
      socketRoom.emit('generateDatabase', { message: 'data-ready-to-download' });
      const lastDate = await db.getLastDate(message);
      worker.postMessage({
        command: 'ask for updates',
        value: lastDate,
      });
    }).catch(console.error);
    return;
  }

  if (message.type === 'new-data-received') {
    db.update(message).then(() => {
      console.log(`add new data ${message.lastDate}`);
      getWorker(message).socketRoom.emit('public-chart-data-update');
    }).catch(console.error);
  }
}


module.exports = {
  initWorker,
};
