function stateChanged() {
  browser.storage.session
    .get()
    .then(
      (state) =>
        (document.getElementById("json").textContent = JSON.stringify(
          state,
          undefined,
          2,
        )),
    );
}

browser.storage.session.onChanged.addListener(stateChanged);
document.addEventListener("DOMContentLoaded", stateChanged)

document.querySelector("button").addEventListener("click", function () {
  browser.runtime.sendMessage({ action: "update" });
});
