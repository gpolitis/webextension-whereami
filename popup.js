browser.runtime
  .getBackgroundPage()
  .then((page) => {
    document.getElementById("json").textContent = JSON.stringify(
      page.ipInfo,
      undefined,
      2
    );
  })
  .catch((error) => console.error(error.message));
