function stateChanged(state) {
  document.getElementById("json").textContent = JSON.stringify(
    state,
    undefined,
    2
  );
}
browser.runtime.onMessage.addListener((message) =>
  stateChanged(message.baseState)
);
browser.runtime
  .sendMessage({ action: "getState" })
  .then((response) => stateChanged(response.baseState))
  .catch((error) => console.error(error));

document.querySelector("button").addEventListener("click", function () {
  browser.runtime
    .sendMessage({ action: "updateAddrInfo" })
    .catch((error) => console.error(error));
});

// TODO needs to listen for options changes (=> enable/disable the update button).
// TODO implement some visual feedback when the state changes live