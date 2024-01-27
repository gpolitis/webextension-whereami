import {produce} from "immer";

let updateAddrInfo;
let baseState = {};

function updateState(recipe) {
  baseState = produce(baseState, (draftState) => recipe(draftState), undefined);
  browser.runtime.sendMessage({ baseState }).catch((error) => {
    // console.debug(error);
  });
}

function makeUpdateAddrInfo(token) {
  return function () {
    console.debug("Updating.");
    fetch("https://api.ipify.org")
      .then((response) => response.text())
      .then((addr) => {
        const now = new Date();
        updateState((draftState) => {
          if (draftState.error) {
            delete draftState.error.ipGet;
          }
          draftState.checkTime = now.toLocaleString();
        });
        if (!baseState.ipInfo || baseState.ipInfo.ip !== addr) {
          console.info(`IP address changed to ${addr}.`);
          fetch(`https://ipinfo.io/${addr}?token=${token}`)
            .then((response) => response.json())
            .then((json) => {
              updateState((draftState) => {
                if (draftState.error) {
                  delete draftState.error.ipInfo;
                }
                draftState.modifiedTime = now.toLocaleString();
                draftState.ipInfo = json;
              });
              browser.browserAction.setIcon({
                path: {
                  16: `icons/${json.country}.svg`.toLowerCase(),
                  32: `icons/${json.country}.svg`.toLowerCase(),
                },
              }).catch(error => console.error(error));
            })
            .catch((error) =>
              updateState((draftState) => {
                if (!draftState.error) {
                  draftState.error = {};
                }
                draftState.error.ipInfo = error.toString();
              })
            );
        }
      })
      .catch((error) =>
        updateState((draftState) => {
          if (!draftState.error) {
            draftState.error = {};
          }
          draftState.error.ipGet = error.toString();
        })
      );
  };
}

const tokenChanged = (function () {
  let token;

  return function (newValue) {
    if (token !== newValue) {
      if (
        updateAddrInfo &&
        browser.alarms.onAlarm.hasListener(updateAddrInfo)
      ) {
        browser.alarms.onAlarm.removeListener(updateAddrInfo);
      }
      token = newValue;
      updateAddrInfo = null;
      if (token) {
        updateAddrInfo = makeUpdateAddrInfo(token);
        updateAddrInfo();
        browser.alarms.onAlarm.addListener(updateAddrInfo);
      } else {
        browser.browserAction.setIcon({
          path: {
            16: "icons/xx.svg",
            32: "icons/xx.svg",
          },
        }).catch(error => console.error(error));
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
      browser.alarms.clearAll().catch(error => console.error(error));
      browser.alarms.create("periodic-update", { periodInMinutes });
      console.debug(`Scheduled update every ${periodInMinutes} minutes.`);
    }
  };
})();

document.addEventListener("stateChanged", function () {
  browser.browserAction.setBadgeText({
    text: Object.keys(baseState.error || {}).length ? "!" : "",
  }).catch(error => console.error(error));
});

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case "getState":
      sendResponse({ baseState });
      break;
    case "updateAddrInfo":
      updateAddrInfo();
      break;
  }
});

browser.storage.sync
  .get()
  .then((options) => {
    updateState((draftState) => {
      if (draftState.error) {
        delete draftState.error.sync;
      }
    });
    tokenChanged(options.token);
    periodInMinutesChanged(options.periodInMinutes);
  })
  .catch((error) => {
    updateState((draftState) => {
      if (!draftState.error) {
        draftState.error = {};
      }
      draftState.error.sync = error.toString();
    });
  });

browser.storage.sync.onChanged.addListener((changes) => {
  if (changes.token) {
    tokenChanged(changes.token.newValue);
  }

  if (changes.periodInMinutes) {
    periodInMinutesChanged(changes.periodInMinutes.newValue);
  }
});
