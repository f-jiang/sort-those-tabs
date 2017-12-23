/// <reference types="chrome"/>

import { Injectable } from '@angular/core';

@Injectable()
export class WindowsService {

  private currentWindows: chrome.windows.Window[];
  public editedWindows: chrome.windows.Window[];

  constructor() {
    this.loadCurrentWindows();
  }

  loadCurrentWindows(): void {
    chrome.windows.getAll({ 'populate': true }, (windows: chrome.windows.Window[]) => {
      // Recursively deep-copy windows
      this.currentWindows = this.editedWindows = JSON.parse(JSON.stringify(windows));
    });
  }

  applyEditedWindows(): void {
    // later:
    // TODO: get differences between current and edited windows and modify tabs accordingly
    // TODO: if chrome api updates successful, set currentWindows = editedWindows

    chrome.windows.getCurrent({ 'populate': false }, (currentWindow: chrome.windows.Window) => {
      chrome.tabs.getCurrent((extensionTab: chrome.tabs.Tab) => {
        // Close the currently opened windows. If the window contains the extension tab, leave the extension tab open
        // but close the rest.
        for (const window of this.currentWindows) {
          if (window.id !== currentWindow.id) {
            chrome.windows.remove(window.id);
          } else {
            const tabIds = [];

            for (const tab of currentWindow.tabs) {
              if (tab.id !== extensionTab.id) {
                tabIds.push(tab.id);
              }
            }

            chrome.tabs.remove(tabIds);
          }
        }

        // Open the windows in this.editedWindows. If the edited window doesn't contain the extension tab, open it
        // while retaining its state, size, and position. Otherwise, open the rest of the tabs in a new window separate
        // from the one containing the extension.
        for (const window of this.editedWindows) {
          const createData: { [k: string]: any } = {
            type: window.type,
            state: window.state
          };

          if (window.state !== 'maximized') {
            createData.width = window.width;
            createData.height = window.height;
            createData.left = window.left;
            createData.top = window.top;
          }

          const tabIds = [];

          for (const tab of window.tabs) {
            if (tab.id !== extensionTab.id) {
              tabIds.push(tab.id);
            }
          }

          createData.url = (tabIds.length > 1) ? tabIds : tabIds[0];

          chrome.windows.create(createData);
        }

        this.loadCurrentWindows();
      });
    });
  }

  resetEditedWindows(): void {
    // Recursively deep-copy this.currentWindows
    this.editedWindows = JSON.parse(JSON.stringify(this.currentWindows));
  }

}
