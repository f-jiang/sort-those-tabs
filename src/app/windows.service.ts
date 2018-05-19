/// <reference types="chrome"/>

import { Injectable } from '@angular/core';

import ChromePromise from 'chrome-promise';

import { Window } from './window';
import { getCopy } from './utils';

// TODO resolve workaround
// temp workaround for buggy chromep api calls
import { Tab } from './tab';
// end of workaround

const chromep: ChromePromise = new ChromePromise();

@Injectable()
export class WindowsService {

  private _data: Window[];

  private async getAllWindows(): Promise<Window[]> {
    return await chromep.windows.getAll({'populate': true}).then(
      (chromeWindows: chrome.windows.Window[]) => {
        return chromeWindows.map(chromeWindow => Window.fromChromeWindow(chromeWindow));
      }
    );
  }

  public get data(): Window[] {
    return getCopy(this._data);
  }

  public async init(): Promise<void> {
    await this.loadData();
  }

  public async loadData(): Promise<void> {
    this._data = await this.getAllWindows();
  }

  // TODO use set util functions such as intersection and difference
  public async update(editedWindows: Window[]): Promise<void> {
    const originalWindowIds: Set<number> = new Set(this._data.map(win => win.id));
    const editedWindowIds: Set<number> = new Set(editedWindows.map(win => win.id));

    // TODO could probably get rid of ID sets
    // found in |editedWindows| only
    const newWindows_ids: Set<number> = new Set(Array.from(editedWindowIds)
      .filter(winId => !originalWindowIds.has(winId)));
    // found in both |editedWindows| and |this._data|
    const windowsInCommon_ids: Set<number> = new Set(Array.from(editedWindowIds)
      .filter(winId => originalWindowIds.has(winId)));
    // found in |this._data| only
    const windowsToRemove_ids: Set<number> = new Set(Array.from(originalWindowIds)
      .filter(winId => !editedWindowIds.has(winId)));

    const allDetachedTabs_ids: Set<number> = new Set();

    // TODO resolve workaround
    // temp workaround for buggy chromep.windows.get() call
    const unsortedWindowsMap: Map<number, Window> = new Map();  // represents the state of the browser windows prior
                                                                // to tab-sorting and window-closing
    for (const window of this._data) {
      unsortedWindowsMap.set(window.id, window);
    }
    // end workaround

    // 1. windows present after editing but not before: create them

    const newWindows: Window[] = editedWindows.filter(win => newWindows_ids.has(win.id));
    for (const newWindow of newWindows) {
      const tabsToDetach_ids: number[] = newWindow.tabs.map(tab => tab.id);
      const result: chrome.windows.Window = await chromep.windows.create({tabId: tabsToDetach_ids[0]});

      // move additional detached tabs to new window
      if (tabsToDetach_ids.length > 1) {
        await chromep.tabs.move(tabsToDetach_ids.slice(1, tabsToDetach_ids.length), {windowId: result.id, index: -1});
      }

      for (const tabId of tabsToDetach_ids) {
        allDetachedTabs_ids.add(tabId);
      }

      // TODO resolve workaround
      // temp workaround for buggy chromep.windows.get() call
      // resultWindow has the old state with only the initial tab, so need to add the rest
      const resultWindow: Window = Window.fromChromeWindow(result);
      const detachedTabs: Tab[] = [];

      for (const detachedTabId of tabsToDetach_ids) {
        for (const window of unsortedWindowsMap.values()) {
          const detachedTabIndex: number = window.tabs.findIndex(tab => tab.id === detachedTabId);

          // transfer detached tab from original window to new detached window
          if (detachedTabIndex !== -1) {
            const detachedTab: Tab = window.tabs.splice(detachedTabIndex, 1)[0];

            // need to manually close windows that had all tabs removed
            if (window.tabs.length === 0) {
              unsortedWindowsMap.delete(window.id);
            }

            detachedTabs.push(detachedTab);
            break;
          }
        }
      }

      resultWindow.tabs = detachedTabs;
      unsortedWindowsMap.set(result.id, resultWindow);
      // end workaround
    }

    // 2. windows present both before and after editing: move and/or close the windows' tabs as needed, then sort them

    // original and edited states of pre-existing windows that weren't closed via extension
    const windowsInCommon_original: Window[] = this._data
      .filter(win => windowsInCommon_ids.has(win.id));
    const windowsInCommon_edited: Window[] = editedWindows
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

    // 2.1: for each window present both before and after editing, remove and move their tabs as needed

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
          const result: chrome.tabs.Tab = await chromep.tabs.create({windowId: +windowId});
          placeholderTabs_ids.push(result.id);
        }

        // TODO resolve workaround
        // no placeholder tabs needed for workaround
      }

      if (tabsToMove_ids.length > 0) {
        await chromep.tabs.move(tabsToMove_ids, {index: -1, windowId: windowInCommon_id});
      }

      // TODO resolve workaround
      // temp workaround for buggy chromep.windows.get() call
      const tabsInWindow: Tab[] = unsortedWindowsMap.get(windowInCommon_id).tabs;

      for (const tabToMove_id of tabsToMove_ids) {
        for (const window of unsortedWindowsMap.values()) {
          if (window.id === windowInCommon_id) {
            continue;
          }

          const tabToMove_index: number = window.tabs.findIndex(tab => tab.id === tabToMove_id);

          // transfer tab from original window to new window
          if (tabToMove_index !== -1) {
            const tabToMove: Tab = window.tabs.splice(tabToMove_index, 1)[0];

            // need to manually close windows that had all tabs removed
            if (window.tabs.length === 0) {
              unsortedWindowsMap.delete(window.id);
            }

            tabsInWindow.push(tabToMove);
            break;
          }
        }
      }
      // end workaround

      // close tabs to be removed from window

      // tabs to be removed...
      const tabsToRemove_ids: number[] = Array.from(originalTabIds).filter(
        id => !editedTabIds.has(id) &&          // ...can't be in the window after editing via the extension
          !windowsInCommon_tabIdsSet_edited.has(id) &&   // ...can't have been transferred into another unclosed window
          !allDetachedTabs_ids.has(id));                 // ...can't be one of the detached tabs

      if (tabsToRemove_ids.length > 0) {
        await chromep.tabs.remove(tabsToRemove_ids);
      }

      // TODO resolve workaround
      // temp workaround for buggy chromep.windows.get() call
      unsortedWindowsMap.get(windowInCommon_id).tabs = tabsInWindow.filter(
        tab => tabsToRemove_ids.indexOf(tab.id) === -1
      );
      // end workaround
    }

    if (placeholderTabs_ids.length > 0) {
      await chromep.tabs.remove(placeholderTabs_ids);
    }

    // 2.2. sort the tabs in each of the windows from part 2.1

    for (const windowInCommon_id of Array.from(windowsInCommon_ids)) {
      const targetSortOrder: number[] = Array.from(windowsInCommon_tabIdsMap_edited.get(windowInCommon_id));

      // buggy api call
      // const editedWindow: Window = Window.fromChromeWindow(await chromep.windows.get(windowInCommon_id, {populate: true}));
      const editedWindow: Window = unsortedWindowsMap.get(windowInCommon_id);

      const currentTabIds: number[] = editedWindow.tabs.map(tab => tab.id);
      const currentSortOrder: number[] = currentTabIds.map(id => targetSortOrder.indexOf(id));

      // selection sort
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
          await chromep.tabs.move(currentTabIds[i], {index: minIndex, windowId: windowInCommon_id});
          await chromep.tabs.move(currentTabIds[minIndex], {index: i, windowId: windowInCommon_id});

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

    // 3. windows present before editing but not after: remove them
    // this step must occur after steps 1 and 2

    // buggy api call
    // const currentWindowIds: number[] = (await this.getAllWindows()).map(window => window.id);
    const currentWindowIds: number[] = Array.from(unsortedWindowsMap.keys());

    for (const windowToRemove_id of Array.from(windowsToRemove_ids)) {
      if (currentWindowIds.indexOf(windowToRemove_id) !== -1) {
        await chromep.windows.remove(windowToRemove_id);
      }
    }

    await this.loadData();

    // TODO: resolve workaround
    // temp workaround for buggy chromep.windows.getAll() call: manually remove closed windows from result
    // of chromep.windows.getAll(), and update tabs of the remaining windows
    for (let i = 0; i < this._data.length; ) {
      if (windowsToRemove_ids.has(this._data[i].id)) {
        this._data.splice(i, 1);
      } else {
        if (windowsInCommon_ids.has(this._data[i].id)) {
          this._data[i].tabs = editedWindows.find(window => window.id === this._data[i].id).tabs;
        }

        i++;
      }
    }
    // end workaround
  }

}
