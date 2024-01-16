function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
      token: document.querySelector("#token").value,
    });
  }
  
  function restoreOptions() {
    function setCurrentChoice(result) {
      document.querySelector("#token").value = result.token || '';
    }
  
    function onError(error) {
      console.log(`Error: ${error}`);
    }
  
    let getting = browser.storage.sync.get("token");
    getting.then(setCurrentChoice, onError);
  }
  
  document.addEventListener("DOMContentLoaded", restoreOptions);
  document.querySelector("form").addEventListener("submit", saveOptions);
  