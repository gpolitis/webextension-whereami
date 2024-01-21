function saveOptions(e) {
  ["token", "periodInMinutes"].forEach((key) => {
    const value = document.querySelector(`#${key}`).value;
    if (snapshot[key] !== value) {
      snapshot[key] = value;
      if (value) {
        browser.storage.sync.set({ [key]: value });
      } else {
        browser.storage.sync.remove(key);
      }
    }
  });

  e.preventDefault();
}
let snapshot;
function restoreOptions() {
  browser.storage.sync
    .get()
    .then((options) => {
      snapshot = options;
      for (const [key, value] of Object.entries(options)) {
        if (value) {
          document.querySelector(`#${key}`).value = value;
        }
      }
    })
    .catch((error) => console.error(error.message));
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
