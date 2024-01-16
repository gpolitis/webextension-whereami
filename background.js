function updateIcon(token) {
  fetch(`https://ipinfo.io/?token=${token}`)
  .then((response) => response.json())
  .then(function (data) {
    browser.browserAction.setIcon({
      path: {
        "16": `icons/${data.country}.svg`.toLowerCase(),
        "32": `icons/${data.country}.svg`.toLowerCase()
      },
    });
    browser.browserAction.setTitle({title: data.ip});
  });
}

let updateIconWithToken;
function onGot(item) {
  if (updateIconWithToken && browser.alarms.onAlarm.hasListener(updateIconWithToken)) {
    browser.alarms.onAlarm.removeListener(updateIconWithToken);
  }
  
  updateIconWithToken = () => updateIcon(item.token);

  updateIconWithToken();
  browser.alarms.onAlarm.addListener(updateIconWithToken);
}

browser.alarms.create({ periodInMinutes: 1.0 });
browser.storage.sync.get("token").then(onGot);
browser.storage.local.onChanged.addListener(() => {
  browser.storage.sync.get("token").then(onGot);
})
