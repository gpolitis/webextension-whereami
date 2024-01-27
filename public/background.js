async function update() {
  console.info("Checking for IP address changes.");
  const now = new Date();
  let changes = { checked: now.toLocaleString() };

  const response = await fetch("https://api.ipify.org");
  const ip = await response.text();

  const { ipInfo, geolocated } = await browser.storage.session.get([
    "ipInfo",
    "geolocated",
  ]);
  if (!ipInfo || ipInfo.ip !== ip || !geolocated) {
    const { token } = await browser.storage.sync.get("token");
    if (token) {
      console.info(`Fetching IP address information for ${ip}.`);
      const response = await fetch(
        `https://ipinfo.io/${ip}?token=${token}`,
      );
      await browser.storage.session.set({
        ...changes,
        geolocated: now.toLocaleString(),
        ipInfo: await response.json(),
      });
    } else if (!ipInfo || ipInfo.ip !== ip) {
      console.info(`IP address changed to ${ip}.`);
      await browser.storage.session.set({
        ...changes,
        ipInfo: { ip, country: "xx" },
      });
    }
  } else {
    await browser.storage.session.set(changes);
  }
}

function updateSafely() {
  update()
    .then(() => {
      browser.action.setBadgeText({ text: "" });
      browser.storage.session.remove("error");
    })
    .catch((error) => {
      browser.storage.session.set({
        error: error.toString(),
      });
      browser.action.setBadgeText({ text: "!" });
    });
}

browser.runtime.onMessage.addListener(function (message) {
  switch (message.action) {
    case "update":
      updateSafely();
      break;
  }
});

browser.storage.session.onChanged.addListener((changes) => {
  if (changes.ipInfo) {
    const json = changes.ipInfo.newValue;
    browser.action.setIcon({
      path: {
        16: `icons/${json.country}.svg`.toLowerCase(),
        32: `icons/${json.country}.svg`.toLowerCase(),
      },
    });
  }
});

browser.alarms.create("periodic-update", { periodInMinutes: 0.5 });
browser.alarms.onAlarm.addListener(updateSafely);
updateSafely();
