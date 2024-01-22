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

document.querySelector("button").addEventListener("click", function () {
  browser.runtime
    .getBackgroundPage()
    .then((page) => {
      page.update();
    })
    .catch((error) => console.error(error.message));
});
