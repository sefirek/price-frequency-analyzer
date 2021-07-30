import Dygraph from './dygraphs/dygraph';

/**
 *
 */
function waitForUpdate() {
  fetch('/public-update').then((res) => {
    if (res.status === 200) window.location.reload();
  });
}

waitForUpdate();

const g1 = new Dygraph(
  document.body,
  '/data/EURUSD5.csv', // path to CSV file
  {}, // options
);
