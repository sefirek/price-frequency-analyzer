const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');

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
const initDatabase = require('./server/initDatabase');


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
app.use('/data', express.static(`${__dirname}/data`));
// app.use('/js/dygraphs', express.static(`${__dirname}/node_modules/dygraphs/src`));
app.get('/js/dygraphs/*', (req, res) => {
  const fileName = `${__dirname}/node_modules/dygraphs/src${req.url.split('/js/dygraphs')[1]}.js`;

  if (fs.existsSync(fileName)) {
    res.sendFile(fileName);
  } else {
    res.sendStatus(404);
  }
});
app.get('/js/*', (req, res) => {
  const fileName = `${__dirname}/${publicFolder}${req.url}.js`;

  if (fs.existsSync(fileName)) {
    res.sendFile(fileName);
  } else {
    res.sendStatus(404);
  }
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/${publicFolder}/index.html`);
});
app.get('/public-update', (req, res) => {
  responders.push(res);
});
app.get('/public-chart-data-update', (req, res) => {
  updateResponders.push(res);
});
app.post('/upload', (req, res) => {
  fs.writeFileSync(`${cwd}/data/tmp.json`, JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});
app.listen(port, () => {
  console.info(`Analyzer listening at http://localhost:${port}`);
});

/**
 *
 */
function broadcastUpdateStatus() {
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
  const copy = [...updateResponders.splice(0)];
  if (copy.length) {
    do {
      try {
        copy[0].sendStatus(200);
      } catch (e) {}
    } while (copy.shift());
  }
}

initDatabase('poloniex', 'TRXUSDT', '5m', broadcastUpdateStatus).then(() => console.info('Utworzono bazę')).catch(error => console.warn(error.message)).catch(console.error);

watchingChanges(() => {
  if (responders.length) {
    do {
      try {
        responders[0].sendStatus(200);
      } catch (e) {}
    } while (responders.shift());
  }
});
