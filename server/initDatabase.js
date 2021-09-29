const fs = require('fs');
const fetch = require('node-fetch');
const EXCHANGES = require('./exchanges/Exchanges');

const cwd = process.cwd();
const FIVE_MINUTES_PER_DAY = 12 * 24;
const MAX_SAMPLES_COUNT = 1000;

/**
 * @param {string} symbol
 * @param exchangeName
 * @param {string} interval
 * @param onDataUpdateCallback
 * @returns {*}
 */
async function initDatabase(exchangeName, symbol, interval, onDataUpdateCallback) {
  const monthData = {};
  let lastYear = null;

  const symbolPath = getSymbolPath(exchangeName, symbol);
  const exchangeDirPath = getExchangePath(exchangeName);
  if (!fs.existsSync(exchangeDirPath)) {
    fs.mkdirSync(exchangeDirPath);
  }
  if (!fs.existsSync(symbolPath)) {
    fs.mkdirSync(symbolPath);
  }


  const fileList = createFilesList(exchangeName, symbol);
  if (!isFileListExists(exchangeName, symbol)) {
    const fileListPath = getListPath(exchangeName, symbol);
    fs.writeFileSync(fileListPath, JSON.stringify(fileList, null, 2));
  }


  fileList.forEach((filePath) => {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    json.forEach((record) => {
      Object.assign(record, { time: new Date(record.time) });
    });
    updateData(json, false, true);
  });

  // if (fs.existsSync(symbolPath)) {
  //   throw new Error(`Istnieje baza ${symbol}`);
  // }

  /**
   * @param newDataArray
   * @param runCallback
   * @param onlyUpdate
   */
  function updateData(newDataArray, runCallback = false, onlyUpdate = false) {
    let index = 0;
    console.log('aa', newDataArray.length);
    while (index < newDataArray.length) {
      const record = newDataArray[index];
      const month = record.time.getMonth();
      lastYear = record.time.getFullYear();
      const FIVE_MINUTES_PER_MONTH = FIVE_MINUTES_PER_DAY * new Date(lastYear, month, 0).getDate();

      const dateName = `${lastYear}-${numToStr(month + 1)}`;
      const monthlyDataObject = monthData[dateName] || {};
      monthlyDataObject[record.time.toString()] = record.close;
      // if (!onlyUpdate) saveMonthlyDataObjectToFile(exchangeName, symbol, dateName, monthlyDataObject);
      monthData[dateName] = monthlyDataObject;
      if (!onlyUpdate && Object.keys(monthlyDataObject).length === FIVE_MINUTES_PER_MONTH) {
        saveMonthlyDataObjectToFile(exchangeName, symbol, dateName, monthlyDataObject);
        // delete monthData[dateName];
      }
      index += 1;
    }
    console.log('xx');
    if (runCallback) {
      onDataUpdateCallback();
    }
  }

  const prepareData = async binanceJson => new Promise((resolve, reject) => {
    // console.log('przetworzone');
    updateData(binanceJson);
    resolve();
  });

  const saveListPathToFile = () => {
    Object.keys(monthData).forEach((dateName) => {
      const monthlyDataObject = monthData[dateName];
      const symbolDateFileName = getSymbolDateFileName(exchangeName, symbol, dateName);
      // if (!fs.existsSync(symbolDateFileName))
      {
        saveMonthlyDataObjectToFile(exchangeName, symbol, dateName, monthlyDataObject);
      }
    });
    const fileListPath = getListPath(exchangeName, symbol);
    fs.writeFileSync(fileListPath, JSON.stringify(createFilesList(exchangeName, symbol), null, 2));
    console.log('save');
  };

  const doneFunction = () => {
    saveListPathToFile();
    runUpdateFetch();
  };

  if (!fileList.length) {
    EXCHANGES[exchangeName].loadMaxSizeData(
      prepareData, doneFunction, symbol, interval,
    );
  } else {
    runUpdateFetch();
  }


  /**
   *
   */
  function runUpdateFetch() {
    updateFetch().then(() => {
      const WAITING_TIME = 310 * 1000;
      const timeToFirstFetch = WAITING_TIME - (Date.now() % WAITING_TIME);
      console.log('waiting time', timeToFirstFetch);
      console.log('started at', new Date());
      setTimeout(() => {
        updateFetch().then(() => {
          setInterval(updateFetch, Number.parseInt(interval, 10) * 60 * 1000);
        });
      }, timeToFirstFetch);
    });
  }

  /**
   *
   */
  async function updateFetch() {
    console.log('update fetch');
    ensureCanFetchNext();
    let startDate = new Date(0);
    const lastMonthName = Object.keys(monthData).pop();
    Object.keys(monthData[lastMonthName]).forEach((stringTime) => {
      const time = new Date(stringTime);
      if (startDate.getTime() < time.getTime()) {
        startDate = time;
      }
    });
    EXCHANGES[exchangeName].loadMaxSizeData(
      updateData, () => {
        saveListPathToFile();
        onDataUpdateCallback();
      }, symbol, interval, startDate,
    );
    // return fetch(EXCHANGES[exchangeName].getNextUrl(symbol, interval, 'forward'))
    //   .then(res => res.json())
    //   .then((data) => {
    //     const json = EXCHANGES[exchangeName].arrayToJSON(data);
    //     updateData(json, true);
    //   });
  }

  /**
   *
   */
  function ensureCanFetchNext() {
    const lastFetchMonth = Object.keys(monthData).sort((a, b) => a.localeCompare(b)).pop();
    const allowedMills = 1000 * 60 * 5;
    let lastFetchDate = null;
    if (monthData[lastFetchMonth] === undefined) {
      lastFetchDate = new Date(Date.now() - allowedMills * MAX_SAMPLES_COUNT);
      console.log('puste');
    } else {
      lastFetchDate = new Date(Object.keys(monthData[lastFetchMonth]).pop());
    }

    const diffCount = Math.floor((Date.now() - lastFetchDate.getTime()) / allowedMills);
    if (diffCount > MAX_SAMPLES_COUNT) {
      console.log({ lastFetchDate });
      EXCHANGES[exchangeName].loadMaxSizeData(
        updateData, saveListPathToFile, symbol, interval, lastFetchDate,
      );
    }
  }
}

/**
 * @param {number} num
 * @returns {string}
 */
function numToStr(num) {
  if (num < 10) return `0${num}`;
  return num;
}

/**
 * @param symbol
 * @param dateName
 * @param exchangeName
 * @param monthlyDataObject
 */
function saveMonthlyDataObjectToFile(exchangeName, symbol, dateName, monthlyDataObject) {
  const monthData = Object.entries(monthlyDataObject)
    .map(([time, close]) => ({ time, close }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  saveToFile(exchangeName, symbol, dateName, monthData);
}

/**
 * @param {string} symbol
 * @param {string} dateName
 * @param exchangeName
 * @param {{}[]} monthData
 */
function saveToFile(exchangeName, symbol, dateName, monthData) {
  const symbolDateFileName = getSymbolDateFileName(exchangeName, symbol, dateName);
  // if (fs.existsSync(symbolDateFileName)) {
  //   throw new Error(`Plik ${symbolDateFileName} już istnieje`);
  // }

  fs.writeFileSync(symbolDateFileName, JSON.stringify(monthData));
}

/**
 * @param exchangeName
 * @param symbol
 */
function createFilesList(exchangeName, symbol) {
  const url = `${cwd}/data/${exchangeName}/${symbol}`;
  return fs.readdirSync(url)
    .filter(fileName => fileName !== 'list.json')
    .map(fileName => `${cwd}/data/${exchangeName}/${symbol}/${fileName}`);
}

/**
 * @param exchangeName
 * @param {string} symbol
 * @returns {string} url
 */
function isFileListExists(exchangeName, symbol) {
  const listPath = getListPath(exchangeName, symbol);
  return fs.existsSync(listPath);
}

/**
 * @param exchangeName
 * @param symbol
 */
function getListPath(exchangeName, symbol) {
  return `${cwd}/data/${exchangeName}/${symbol}/list.json`;
}

/**
 * @param {string} symbol
 * @param dateName
 * @param exchangeName
 * @param {Date} date
 * @returns {string}
 */
function getSymbolDateFileName(exchangeName, symbol, dateName) {
  const symbolPath = getSymbolPath(exchangeName, symbol);
  // const strMonth = numToStr(date.getMonth() + 1);
  // return `${symbolPath}/${date.getFullYear()}-${strMonth}.json`;
  return `${symbolPath}/${dateName}.json`;
}

/**
 * @param {string} exchangeName
 * @param {string} symbol
 * @returns {string}
 */
function getSymbolPath(exchangeName, symbol) {
  return `${getExchangePath(exchangeName)}/${symbol}`;
}

/**
 * @param {string} exchangeName
 * @returns {string}
 */
function getExchangePath(exchangeName) {
  return `${cwd}/data/${exchangeName}`;
}

module.exports = initDatabase;
