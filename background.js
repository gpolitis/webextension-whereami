var state = {};
var update;

function backgroundError(key, value) {
  if (value) {
    state.error ??= {};
    state.error[key] = value.toString();
  } else if (state.error) {
    delete state.error[key];

    const errorSize = Object.keys(state.error).length;
    if (errorSize == 0) {
      delete state.error;
    }
  }

  browser.browserAction.setBadgeText({ text: state.error ? "!" : "" });
}

function makeUpdate(token) {
  return function () {
    console.debug("Updating.");
    fetch("https://api.ipify.org")
      .then((response) => response.text())
      .then((addr) => {
        backgroundError("ipGet");
        const now = new Date();
        state.checkTime = now.toLocaleString();
        if (!state.ipInfo || state.ipInfo.ip !== addr) {
          console.info(`IP address changed to ${addr}.`);
          fetch(`https://ipinfo.io/${addr}?token=${token}`)
            .then((response) => response.json())
            .then((json) => {
              backgroundError("ipInfo");
              state.modifiedTime = state.checkTime;
              state.ipInfo = json;
              browser.browserAction.setBadgeText({ text: "" });
              browser.browserAction.setIcon({
                path: {
                  16: `icons/${json.country}.svg`.toLowerCase(),
                  32: `icons/${json.country}.svg`.toLowerCase(),
                },
              });
            })
            .catch((error) => backgroundError("ipInfo", error));
        }
      })
      .catch((error) => backgroundError("ipGet", error));
  };
}

const tokenChanged = (function () {
  let token;

  return function (newValue) {
    if (token !== newValue) {
      if (update && browser.alarms.onAlarm.hasListener(update)) {
        browser.alarms.onAlarm.removeListener(update);
      }
      token = newValue;
      update = null;
      if (token) {
        update = makeUpdate(token);
        update();
        browser.alarms.onAlarm.addListener(update);
      } else {
        browser.browserAction.setIcon({
          path: {
            16: "icons/xx.svg",
            32: "icons/xx.svg",
          },
        });
      }
    }
  };
})();

const periodInMinutesChanged = (function () {
  let periodInMinutes;

  return function (newValue) {
    const newPeriodInMinutes = parseFloat(newValue) || 0.5;
    if (periodInMinutes !== newPeriodInMinutes) {
      periodInMinutes = newPeriodInMinutes;
      browser.alarms.clearAll();
      browser.alarms.create("periodic-update", { periodInMinutes });
      console.debug(`Scheduled update every ${periodInMinutes} minutes.`);
    }
  };
})();

browser.storage.sync
  .get()
  .then((options) => {
    backgroundError("sync");
    tokenChanged(options.token);
    periodInMinutesChanged(options.periodInMinutes);
  })
  .catch((error) => backgroundError("sync", error));

browser.storage.sync.onChanged.addListener((changes) => {
  if (changes.token) {
    tokenChanged(changes.token.newValue);
  }

  if (changes.periodInMinutes) {
    periodInMinutesChanged(changes.periodInMinutes.newValue);
  }
});
