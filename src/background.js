(function() {
  chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.query({ 'title': 'SortThoseTabs', 'currentWindow': true }, function(result) {
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
