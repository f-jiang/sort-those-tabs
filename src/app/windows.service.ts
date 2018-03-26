/// <reference types="chrome"/>

import { Injectable } from '@angular/core';
import { getCopy } from './utils';

import ChromePromise from 'chrome-promise';

const chromep: ChromePromise = new ChromePromise();

@Injectable()
export class WindowsService {

  public windowsPromise: Promise<chrome.windows.Window[]>;

  private _windowsData: chrome.windows.Window[];

  constructor() {
    this.windowsPromise = new Promise<chrome.windows.Window[]>((resolve: (windows: chrome.windows.Window[]) => void) => {
      chrome.windows.getAll({'populate': true}, resolve);
    });

    this.windowsPromise.then((windows: chrome.windows.Window[]) => {
      this._windowsData = getCopy(windows);
    });
  }

  get windowsData(): chrome.windows.Window[] {
    return getCopy(this._windowsData);
  }

  async applyEditedWindows(editedWindows: chrome.windows.Window[]): Promise<void> {
    const originalWindowIds: Set<number> = new Set(this._windowsData.map(win => win.id));
    const editedWindowIds: Set<number> = new Set(editedWindows.map(win => win.id));

    // TODO could probably get rid of ID sets
    // found in |editedWindows| only
    const newWindows_ids: Set<number> = new Set(Array.from(editedWindowIds)
      .filter(winId => !originalWindowIds.has(winId)));
    // found in both |editedWindows| and |this._windowsData|
    const windowsInCommon_ids: Set<number> = new Set(Array.from(editedWindowIds)
      .filter(winId => originalWindowIds.has(winId)));
    // found in |this._windowsData| only
    const windowsToRemove_ids: Set<number> = new Set(Array.from(originalWindowIds)
      .filter(winId => !editedWindowIds.has(winId)));

    const allDetachedTabs_ids: Set<number> = new Set();

    // 1. create the windows consisting of detached tabs

    const newWindows: chrome.windows.Window[] = editedWindows.filter(win => newWindows_ids.has(win.id));
    for (const newWindow of newWindows) {
      const tabsToDetach_ids: number[] = newWindow.tabs.map(tab => tab.id);
      const result: chrome.windows.Window = await chromep.windows.create({ tabId: tabsToDetach_ids[0] });

      // move additional detached tabs to new window
      if (tabsToDetach_ids.length > 1) {
        await chromep.tabs.move(tabsToDetach_ids.slice(1, tabsToDetach_ids.length), {windowId: result.id, index: -1});
      }

      for (const tabId of tabsToDetach_ids) {
        allDetachedTabs_ids.add(tabId);
      }
    }

    // 2. rearrange pre-existing windows' tabs

    // original and edited states of pre-existing windows that weren't closed via extension
    const windowsInCommon_original: chrome.windows.Window[] = this._windowsData
      .filter(win => windowsInCommon_ids.has(win.id));
    const windowsInCommon_edited: chrome.windows.Window[] = editedWindows
      .filter(win => windowsInCommon_ids.has(win.id));

    // maps of above windows' tab id arrays; key = windowId, value = set of tab ids
    const windowsInCommon_tabIdsMap_original: Map<number, Set<number>> = new Map();
    const windowsInCommon_tabIdsMap_edited: Map<number, Set<number>> = new Map();
    const windowsInCommon_tabIdsSet_edited: Set<number> = new Set();

    // populate tab id maps and sets

    for (const window of windowsInCommon_original) {
      windowsInCommon_tabIdsMap_original.set(window.id, new Set(window.tabs.map(tab => tab.id)));
    }

    for (const window of windowsInCommon_edited) {
      const tabIds: number[] = window.tabs.map(tab => tab.id);

      windowsInCommon_tabIdsMap_edited.set(window.id, new Set(tabIds));

      for (const tabId of tabIds) {
        windowsInCommon_tabIdsSet_edited.add(tabId);
      }
    }

    // if a certain window has all its original tabs moved to other windows via the extension, a temporary tab will be
    // created in that window. this way, the window will stay open so that incoming tabs can still be transferred
    // properly. the id of the temporary tab is stored in the following array so that the tab can be closed after all
    // other tabs have been transferred successfully.
    const placeholderTabs_ids: number[] = [];

    for (const windowInCommon_id of Array.from(windowsInCommon_ids)) {
      // set of ids of tabs present in the window, before and after modification
      const originalTabIds: Set<number> = windowsInCommon_tabIdsMap_original.get(windowInCommon_id);
      const editedTabIds: Set<number> = windowsInCommon_tabIdsMap_edited.get(windowInCommon_id);

      // move transferred tabs into the window

      const tabsToMove_ids: number[] = Array.from(editedTabIds).filter(id => !originalTabIds.has(id));

      for (const [windowId, tabIds] of windowsInCommon_tabIdsMap_original) {
        const intersection: number[] = tabsToMove_ids.filter(id => tabIds.has(id));

        // if tabIds is a subset of tabsToMove_ids, create a temporary tab
        if (intersection.length === tabIds.size) {
          const result: chrome.tabs.Tab = await chromep.tabs.create({ windowId: +windowId });
          placeholderTabs_ids.push(result.id);
        }
      }

      if (tabsToMove_ids.length > 0) {
        await chromep.tabs.move(tabsToMove_ids, { index: -1, windowId: windowInCommon_id });
      }

      // TODO untested
      // close tabs to be removed from window

      // tabs to be removed...
      const tabsToRemove_ids: number[] = Array.from(originalTabIds).filter(
        id => !editedTabIds.has(id) &&          // ...can't be in the window after editing via the extension
          !windowsInCommon_tabIdsSet_edited.has(id) &&   // ...can't have been transferred into another unclosed window
          !allDetachedTabs_ids.has(id));                 // ...can't be one of the detached tabs

      if (tabsToRemove_ids.length > 0) {
        await chromep.tabs.remove(tabsToRemove_ids);
      }
    }

    if (placeholderTabs_ids.length > 0) {
      await chromep.tabs.remove(placeholderTabs_ids);
    }

    // 2.1. sort the tabs in each of the windows from part 2

    for (const windowInCommon_id of Array.from(windowsInCommon_ids)) {
      const targetSortOrder: number[] = Array.from(windowsInCommon_tabIdsMap_edited.get(windowInCommon_id));

      const editedWindow: chrome.windows.Window = await chromep.windows.get(windowInCommon_id, { populate: true });
      const currentTabIds: number[] = editedWindow.tabs.map(tab => tab.id);
      const currentSortOrder: number[] = currentTabIds.map(id => targetSortOrder.indexOf(id));

      debugger;

      // selection sort, which allows for fewer swaps and thus fewer calls to chromep.tabs.move()
      for (let i = 0; i < currentTabIds.length; i++) {
        let minIndex = i;

        for (let j = i; j < currentTabIds.length; j++) {
          if (currentSortOrder[j] < currentSortOrder[minIndex]) {
            minIndex = j;
          }
        }

        if (minIndex !== i) {
          let temp: number;

          // swap for the actual tabs; must occur before swapping for currentTabIds
          await chromep.tabs.move(currentTabIds[i], { index: minIndex, windowId: windowInCommon_id });
          await chromep.tabs.move(currentTabIds[minIndex], { index: i, windowId: windowInCommon_id });

          // swap for currentTabIds
          temp = currentTabIds[minIndex];
          currentTabIds[minIndex] = currentTabIds[i];
          currentTabIds[i] = temp;

          // swap for currentSortOrder
          temp = currentSortOrder[minIndex];
          currentSortOrder[minIndex] = currentSortOrder[i];
          currentSortOrder[i] = temp;
        }
      }
    }

    // 3. remove windows closed by the user via the extension

    for (const windowToRemove_id of Array.from(windowsToRemove_ids)) {
      await chromep.windows.remove(windowToRemove_id);
    }

    // TODO update this._windowsData
  }

}
