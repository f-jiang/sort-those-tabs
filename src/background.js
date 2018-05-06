(function() {
  chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.windows.getAll({ 'populate': true }, function(windows) {
      var extensionWindowId = -1;
      var extensionTabId = -1;

      for (var i = 0; i < windows.length; i++) {
        var extensionTabIndex = windows[i].tabs.findIndex(function(tab) {
          // title 'Sort those Tabs' defined in index.html
          return tab.title === 'Sort those Tabs';
        });

        // found the extension tab
        if (extensionTabIndex !== -1) {
          extensionWindowId = windows[i].id;
          extensionTabId = windows[i].tabs[extensionTabIndex].id;
          break;
        }
      }

      // if found, then bring the extension's window and tab into focus
      if (extensionWindowId !== -1 && extensionTabId !== -1) {
        chrome.windows.update(extensionWindowId, { 'focused': true });
        chrome.tabs.update(extensionTabId, { 'active': true });
      // if extension tab not found, create it in the current window
      } else {
        chrome.tabs.create({ 'url': chrome.extension.getURL('index.html') });
      }
    });
  });
})();
