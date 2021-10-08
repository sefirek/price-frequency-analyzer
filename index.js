const express = require('express');
const fs = require('fs');
const socketio = require('socket.io');
const nodemailer = require('nodemailer');

// const { log } = console;
// console.log = function () {
//   log.apply(console, arguments);
//   // Print the stack trace
//   console.trace();
// };
const wm = require('./server/database/WorkerManager');
const db = require('./server/database/DatabaseManager');

/**
 *
 */
async function runWorkers() {
  const tableList = await db.getTableList();
  tableList.forEach((tableName) => {
    const split = tableName.split('__');
    const exchange = split[0];
    const symbol = split[1];
    if (!io.to(tableName)) throw new Error('pusty');
    wm.initWorker({ exchange, symbol }, io.to(tableName));
    console.log(`Worker: ${getRoomName(exchange, symbol)} initialised`);
  });
}

// const transporter = nodemailer.createTransport({
//   host: 'poczta.o2.pl',
//   port: 465,
//   secure: true, // use SSL
//   service: 'o2',
//   auth: {
//     user: 'sefir@o2.pl',
//     pass: 'xxx',
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });


const cwd = process.cwd();
const watchingChanges = require('./watchingChanges');
const { initDatabase, removeDatabase } = require('./server/initDatabase');

const DATA_FOLDER = `${cwd}/data`;

const app = express();
const port = 3000;
const publicFolder = 'public';

const responders = [];
const updateResponders = [];

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/css', express.static(`${__dirname}/${publicFolder}/css`));
app.use('/js', express.static(`${__dirname}/${publicFolder}/js`));
app.use('/img', express.static(`${__dirname}/${publicFolder}/img`));
// app.use('/data', express.static(`${__dirname}/data`));
// app.use('/js/dygraphs', express.static(`${__dirname}/node_modules/dygraphs/src`));
app.get('/js/dygraphs/*', (req, res) => {
  const fileName = `${__dirname}/node_modules/dygraphs/src${req.url.split('/js/dygraphs')[1]}.js`;

  if (fs.existsSync(fileName)) {
    res.sendFile(fileName);
    return;
  }
  res.sendStatus(404);
});
app.get('/js/*', (req, res) => {
  const fileName = `${__dirname}/${publicFolder}${req.url}.js`;

  if (fs.existsSync(fileName)) {
    res.sendFile(fileName);
    return;
  }
  res.sendStatus(404);
});

app.get('/data/*', async (req, res) => {
  console.log(req.url);
  const parts = req.url.split('/');
  const exchange = parts[2];
  const symbol = parts[3];
  const file = parts[4].split('.')[0];
  if (file === 'list') {
    const symbolDates = await db.getSymbolDates({ exchange, symbol });
    symbolDates.push('last-30');
    res.send(JSON.stringify(symbolDates));
    return;
  }
  if (!file.startsWith('last') && file !== 'null') {
    const dateParts = file.split('-');
    const year = Number.parseInt(dateParts[0], 10);
    const month = Number.parseInt(dateParts[1], 10) - 1;
    const from = new Date(0);
    from.setFullYear(year, month, 1);
    from.setHours(0);
    const to = new Date(0);
    to.setFullYear(year, month + 1, 1);
    to.setHours(0);
    to.setMilliseconds(-1);
    const monthData = await db.getMonthData({ exchange, symbol }, from, to);
    res.send(JSON.stringify(monthData));
    return;
  }
  if (file.startsWith('last')) {
    const to = await db.getLastDate({ exchange, symbol });
    const from = new Date(to);
    from.setDate(from.getDate() - 30);
    const monthData = await db.getMonthData({ exchange, symbol }, from, to);
    res.send(JSON.stringify(monthData));
    return;
  }
  res.sendStatus(404);
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/${publicFolder}/index.html`);
});

app.post('/upload', (req, res) => {
  fs.writeFileSync(`${DATA_FOLDER}/tmp.json`, JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});
const server = app.listen(port, () => {
  console.info(`Analyzer listening at http://localhost:${port}`);
});
const subscribes = {};

const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Made socket connection');
  socket.on('getExchangeCurrencySymbols', async (exchange) => {
    const exchangeCurrencySymbols = await db.getExchangeCurrencySymbols({ exchange });
    socket.emit('getExchangeCurrencySymbols', exchangeCurrencySymbols);
  });
  socket.on('getExchangeList', async () => {
    const exchangeList = await db.getExchangeList();
    socket.emit('getExchangeList', exchangeList);
  });
  let roomName = null;
  socket.on('subscribeExchangeSymbol', ({ exchange, symbol }) => {
    const currentRoomName = getRoomName(exchange, symbol);
    if (!roomName) roomName = currentRoomName;
    else {
      io.in(socket.id).socketsLeave(roomName);
      roomName = currentRoomName;
    }
    socket.join(roomName);
  });
  socket.on('generateDatabase', ({ exchange, symbol }) => {
    const currentRoomName = getRoomName(exchange, symbol);
    if (!subscribes[currentRoomName]) {
      socket.join(currentRoomName);
      const room = io.to(currentRoomName);
      const socketRoom = {
        emit: (event, message) => {
          room.emit(event, message);
          console.log('generateDatabase', { event, message });
          if (message.message === 'no-data-to-download' || message.error === 'incorrect-symbol') {
            socket.leave(currentRoomName);
          }
        },
      };
      wm.initWorker({ exchange, symbol }, socketRoom);
    }
  });
  io.in(socket.id).socketsJoin('reload');
});
runWorkers();

/**
 * @param exchange
 * @param symbol
 */
function getRoomName(exchange, symbol) {
  return `${exchange}__${symbol}`;
}

/**
 * @param exchange
 * @param symbol
 */
function broadcastUpdateStatus(exchange, symbol) {
  console.log(`broadcast changes ${new Date()}`);
  // const mailOptions = {
  //   from: 'sefir@o2.pl',
  //   to: 'bum_madafaka_icy_0_pena@protonmail.com',
  //   subject: 'Sending Email using Node.js',
  //   text: 'That was easy!',
  // };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log(`Email sent: ${info.response}`);
  //   }
  // });
}


watchingChanges(() => {
  io.to('reload').emit('reload');
});
