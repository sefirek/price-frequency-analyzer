const express = require('express');
const watchingChanges = require('./watchingChanges');

const app = express();
const port = 3000;
const publicFolder = 'public';

const responders = [];

app.use('/css', express.static(`${__dirname}/${publicFolder}/css`));
app.use('/js', express.static(`${__dirname}/${publicFolder}/js`));
app.use('/img', express.static(`${__dirname}/${publicFolder}/img`));
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/${publicFolder}/index.html`);
});
app.get('/public-update', (req, res) => {
  responders.push(res);
});
app.listen(port, () => {
  console.log(`Analyzer listening at http://localhost:${port}`);
});

watchingChanges(() => {
  if (responders.length) {
    do {
      responders[0].sendStatus(200);
    } while (responders.shift());
  }
});
