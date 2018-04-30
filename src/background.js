(function() {
  chrome.browserAction.onClicked.addListener(function(tab) {
    // title 'Sort those Tabs' defined in index.html
    chrome.tabs.query({ 'title': 'Sort those Tabs', 'currentWindow': true }, function(result) {
      debugger;
      // Open the extension in a new tab if it hasn't already been opened in the current window
      if (result.length === 0) {
        chrome.tabs.create({ 'url': chrome.extension.getURL('index.html') });
      // Otherwise, activate the current window's pre-existing extension tab
      } else {
        chrome.tabs.update(result[0].id, { 'active': true }); // Assumption: tab.id property has been defined
      }
    });
  });
})();
