var state = {};
var update;

function updateState(source) {
  state = Object.assign(state, source);
  document.dispatchEvent(new Event("stateChanged"));
}

function makeState(target, source) {
  return Object.fromEntries(
    Object.entries(Object.assign(target || {}, source)).filter(
      ([_, v]) => v != null
    )
  );
}

function makeUpdate(token) {
  return function () {
    console.debug("Updating.");
    fetch("https://api.ipify.org")
      .then((response) => response.text())
      .then((addr) => {
        const now = new Date();
        updateState({
          error: makeState(state.error, { ipGet: null }),
          checkTime: now.toLocaleString(),
        });
        if (!state.ipInfo || state.ipInfo.ip !== addr) {
          console.info(`IP address changed to ${addr}.`);
          fetch(`https://ipinfo.io/${addr}?token=${token}`)
            .then((response) => response.json())
            .then((json) => {
              updateState({
                error: makeState(state.error, { ipInfo: null }),
                modifiedTime: state.checkTime,
                ipInfo: json,
              });
              browser.browserAction.setIcon({
                path: {
                  16: `icons/${json.country}.svg`.toLowerCase(),
                  32: `icons/${json.country}.svg`.toLowerCase(),
                },
              });
            })
            .catch((error) =>
              updateState({
                error: makeState(state.error, { ipInfo: error.toString() }),
              })
            );
        }
      })
      .catch((error) =>
        updateState({
          error: makeState(state.error, { ipGet: error.toString() }),
        })
      );
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

document.addEventListener("stateChanged", function () {
  browser.browserAction.setBadgeText({
    text: Object.keys(state.error).length ? "!" : "",
  });
});

browser.storage.sync
  .get()
  .then((options) => {
    updateState({
      error: makeState(state.error, { sync: null }),
    });
    tokenChanged(options.token);
    periodInMinutesChanged(options.periodInMinutes);
  })
  .catch((error) =>
    updateState({
      error: makeState(state.error, { sync: error.toString() }),
    })
  );

browser.storage.sync.onChanged.addListener((changes) => {
  if (changes.token) {
    tokenChanged(changes.token.newValue);
  }

  if (changes.periodInMinutes) {
    periodInMinutesChanged(changes.periodInMinutes.newValue);
  }
});
