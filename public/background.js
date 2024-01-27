async function update() {
  console.info("Checking for IP address changes.");
  const now = new Date();
  await browser.storage.session.set({ checked: now.toLocaleString() });

  const response = await fetch("https://api.ipify.org");
  const ip = await response.text();

  const item = await browser.storage.session.get("ipInfo");
  if (!item.ipInfo || item.ipInfo.ip !== ip) {
    console.info(`IP address changed to ${ip}.`);
    let ipInfo = { ip, country: "xx" };
    const item = await browser.storage.sync.get("token");
    if (item.token) {
      console.info(`Fetching rich IP information.`);
      const response = await fetch(
        `https://ipinfo.io/${ip}?token=${item.token}`,
      );
      ipInfo = await response.json();
    }
    await browser.storage.session.set({
      modified: now.toLocaleString(),
      ipInfo,
    });
  }
}

browser.runtime.onMessage.addListener(function (message) {
  switch (message.action) {
    case "update":
      void update();
      break;
  }
});

browser.storage.session.onChanged.addListener((changes) => {
  if (changes.ipInfo) {
    const json = changes.ipInfo.newValue;
    void browser.action.setIcon({
      path: {
        16: `icons/${json.country}.svg`.toLowerCase(),
        32: `icons/${json.country}.svg`.toLowerCase(),
      },
    });
  }
});

browser.alarms.create("periodic-update", { periodInMinutes: 0.5 });
browser.alarms.onAlarm.addListener(update);
void update()
