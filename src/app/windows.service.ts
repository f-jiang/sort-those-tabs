/// <reference types="chrome"/>

import { Injectable } from '@angular/core';

function getCopy(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class WindowsService {

  public windowsPromise: Promise<chrome.windows.Window[]>;

  private windowsData: chrome.windows.Window[];

  constructor() {
    this.windowsPromise = new Promise<chrome.windows.Window[]>((resolve: (windows: chrome.windows.Window[]) => void) => {
      chrome.windows.getAll({'populate': true}, resolve);
    });

    this.windowsPromise.then((windows: chrome.windows.Window[]) => {
      this.windowsData = getCopy(windows);
    });
  }

  applyEditedWindows(editedWindows: chrome.windows.Window[]): void {
    // later:
    // TODO: get differences between current and edited windows and modify tabs accordingly
    // TODO: if chrome api updates successful, set currentWindows = editedWindows

    chrome.windows.getCurrent({ 'populate': false }, (currentWindow: chrome.windows.Window) => {
      chrome.tabs.getCurrent((extensionTab: chrome.tabs.Tab) => {
        // Close the currently opened windows. If the window contains the extension tab, leave the extension tab open
        // but close the rest.
        for (const window of this.windowsData) {
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
        for (const window of editedWindows) {
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

        this.windowsData = getCopy(editedWindows);
      });
    });
  }

}
