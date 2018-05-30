/// <reference types="chrome"/>

import ChromePromise from 'chrome-promise';

const chromep: ChromePromise = new ChromePromise();

import { Injectable } from '@angular/core';

@Injectable()
export class TabFocuserService {

  public async focusTab(tabId: number): Promise<void> {
    const allWindows: chrome.windows.Window[] = await chromep.windows.getAll({'populate': true});
    const containingWindow: chrome.windows.Window = allWindows.find((window: chrome.windows.Window): boolean => {
      const tabIds: number[] = window.tabs.map(tab => tab.id);
      return tabIds.indexOf(tabId) !== -1;
    });

    if (containingWindow != null) {
      await chromep.windows.update(containingWindow.id, {'focused': true});
      await chromep.tabs.update(tabId, {'active': true});
    }
  }

}
