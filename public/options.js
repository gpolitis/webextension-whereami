function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    token: document.querySelector(`#token`).value,
  });
}

function restoreOptions() {
  browser.storage.sync.get("token").then((item) => {
    document.querySelector(`#token`).value = item.token || "";
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
