function stateChanged(state) {
  document.getElementById("json").textContent = JSON.stringify(
    state,
    undefined,
    2
  );
}

browser.runtime
  .getBackgroundPage()
  .then((page) => {
    page.document.addEventListener('stateChanged', () => stateChanged(page.state))
    stateChanged(page.state)
  })
  .catch((error) => console.error(error.message));

document.querySelector("button").addEventListener("click", function () {
  browser.runtime
    .getBackgroundPage()
    .then((page) => {
      page.update();
    })
    .catch((error) => console.error(error.message));
});

// TODO needs to listen for options changes (=> enable/disable the update button).
// TODO implement some visual feedback when the state changes live