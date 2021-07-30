/**
 *
 */
function waitForUpdate() {
  fetch('/public-update').then((res) => {
    if (res.status === 200) window.location.reload();
  });
}

waitForUpdate();
