
const sqlite3 = require('sqlite3').verbose();

const cwd = process.cwd();
const db = new sqlite3.Database(`${cwd}/data/database.sqlite3`);


/**
 * @param exchange
 * @param symbol
 */
function getTableName(exchange, symbol) {
  return `${exchange}__${symbol}`;
}

/**
 *
 */
function createTableIfNotExists({ exchange, symbol }) {
  return new Promise((resolve, reject) => {
    db.run(`
    CREATE TABLE IF NOT EXISTS ${getTableName(exchange, symbol)}(
      time TIMESTAMP PRIMARY KEY,
      open REAL NOT NULL,
      high REAL NOT NULL,
      low REAL NOT NULL,
      close REAL NOT NULL
    )
  `, function (err) {
      if (err) {
        reject(err.message);
        return;
      }

      resolve(this);
    });
  });
}

/**
 *
 */
async function getTableList() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT name FROM sqlite_master 
      WHERE 
        type = 'table' AND
        name NOT LIKE 'sqlite_%'
  `, (err, rows) => {
      if (err) {
        reject(err.message);
        return;
      }
      resolve(rows.map(row => row.name));
    });
  });
}

/**
 * @param exchange
 * @param symbol
 */
async function isTableExists(exchange, symbol) {
  const tableList = await getTableList();
  return tableList.includes(getTableName(exchange, symbol));
}

/**
 * @param data
 */
function insertOrReplace({ exchange, symbol }, data) {
  const insertInto = `INSERT OR REPLACE INTO ${getTableName(exchange, symbol)} VALUES `;
  const rows = data.map(({
    time, open, high, low, close,
  }) => `(${time.getTime()}, ${open}, ${high}, ${low}, ${close})`).join(',');

  return new Promise((resolve, reject) => {
    db.run(`${insertInto + rows}`, function (err) {
      if (err) {
        reject(err.message);
        return;
      }
      resolve(this);
    });
  });
}

/**
 * @param message
 */
async function update(message) {
  const { exchange, symbol, value } = message;
  return insertOrReplace({ exchange, symbol }, value);
}

/**
 * @returns {Promise.<Date|null>}
 */
function getLastDate({ exchange, symbol }) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT time
      FROM ${getTableName(exchange, symbol)}
      ORDER BY time DESC
    `, (err, row) => {
      if (err) {
        reject(err.message);
        return;
      }
      resolve(row ? new Date(row.time) : null);
    });
  });
}

/**
 *
 */
async function getExchangeList() {
  const tableList = await getTableList();
  const exchangeSet = new Set(tableList.map(table => table.split('__').shift()));
  return [...exchangeSet];
}

/**
 *
 */
async function getExchangeCurrencySymbols({ exchange }) {
  const tableList = await getTableList();
  const tableSymbolsList = tableList.filter(table => table.startsWith(exchange));
  return tableSymbolsList.map(table => table.split('__').pop());
}

/**
 * @param from
 * @param to
 */
function getMonthData({ exchange, symbol }, from, to) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM ${getTableName(exchange, symbol)}
      WHERE time >= ${from.getTime()} AND time <= ${to.getTime()}
      ORDER BY time ASC
    `, (err, rows) => {
      if (err) {
        reject(err.message);
        return;
      }
      resolve(rows);
    });
  });
}

/**
 *
 */
async function getSymbolDates({ exchange, symbol }) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT DISTINCT strftime('%Y-%m', datetime(time/1000, 'unixepoch')) AS yearMonth
      FROM ${getTableName(exchange, symbol)}
    `, function (err, rows) {
      if (err) {
        reject(err.message);
        return;
      }
      resolve(rows.map(row => row.yearMonth));
    });
  });
}

module.exports = {
  getTableName,
  createTableIfNotExists,
  getTableList,
  isTableExists,
  insertOrReplace,
  update,
  getLastDate,
  getExchangeList,
  getExchangeCurrencySymbols,
  getMonthData,
  getSymbolDates,
};
