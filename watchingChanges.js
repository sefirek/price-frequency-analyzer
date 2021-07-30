const chokidar = require('chokidar');
const path = require('path');


module.exports = (callback) => {
  chokidar.watch(path.join(process.cwd(), 'public'))
    .on('all', async (event, filePath) => {
      if (event === 'change') {
        callback();
      }
    });
};
