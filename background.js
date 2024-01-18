function makeUpdate (token) {
  let addr

  return function () {
    fetch('https://api.ipify.org')
      .then((response) => response.text())
      .then((text) => {
        if (addr !== text) {
          addr = text
          console.log(`IP address changed to ${addr}.`)
          fetch(`https://ipinfo.io/${addr}?token=${token}`)
            .then((response) => response.json())
            .then((json) => {
              browser.browserAction.setIcon({
                path: {
                  16: `icons/${json.country}.svg`.toLowerCase(),
                  32: `icons/${json.country}.svg`.toLowerCase()
                }
              })
              browser.browserAction.setTitle({ title: addr })
            })
        }
      })
  }
}

const tokenChanged = (function () {
  let update
  let token

  return function (newValue) {
    if (token !== newValue) {
      if (update && browser.alarms.onAlarm.hasListener(update)) {
        browser.alarms.onAlarm.removeListener(update)
      }
      token = newValue
      update = null
      if (token) {
        update = makeUpdate(token)
        update()
        browser.alarms.onAlarm.addListener(update)
      } else {
        browser.browserAction.setIcon({
          path: {
            16: 'icons/xx.svg',
            32: 'icons/xx.svg'
          }
        })
      }
    }
  }
})()

const periodInMinutesChanged = (function () {
  let periodInMinutes

  return function (newValue) {
    if (periodInMinutes !== newValue) {
      periodInMinutes = newValue
      periodInMinutes = parseFloat(periodInMinutes) || 0.5
      browser.alarms.clearAll()
      browser.alarms.create('periodic-update', { periodInMinutes })
    }
  }
})()

browser.storage.sync.get().then(options => {
  tokenChanged(options.token)
  periodInMinutesChanged(options.periodInMinutes)
})

browser.storage.sync.onChanged.addListener(changes => {
  if (changes.token) {
    tokenChanged(changes.token.newValue)
  }

  if (changes.periodInMinutes) {
    periodInMinutesChanged(changes.periodInMinutes.newValue)
  }
})
