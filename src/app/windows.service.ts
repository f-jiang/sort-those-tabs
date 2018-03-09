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
    /**
     * scenarios:
     * - 1: |editedWindows| and |_windowsData| have the same windows (no windows created or removed)
     * - 2: |editedWindows| has some windows that |_windowsData| doesn't (windows created by detaching one or more tabs)
     * - 3: |_windowsData| has some windows that |editedWindows| doesn't (windows removed)
     * - 4: both scenarios 2 and 3
     *
     * steps:
     * - categorize windows into 3 separate arrays of window ids:
     *   - windows in |editedWindows| but not in |_windowsData|: new windows that have been detached
     *   - windows in both |editedWindows| and |_windowsData|
     *   - windows in |_windowsData| but not in |editedWindows|: windows that got removed via the extension
     *
     * (not supported yet due to drag and drop restrictions)
     * - for window in |editedWindows| but not in |_windowsData|: new windows that have been detached
     *   - look in |_windowsData| for the tab(s) contained in the new, detached window, and detach it/them into a new window
     *
     * - for each window in both |editedWindows| and |_windowsData|:
     *   - get list of tabs that are in the edited window but not in the original window
     *     - look for each missing tab in the other windows of |_windowsData|
     * - for each window in both |editedWindows| and |_windowsData|:
     *   - get list of tabs that are in the original window but not in the edited window
     *     - remove each of these tabs
     *
     * - for each window in |_windowsData| but not in |editedWindows|:
     *   - remove
     *
     * - if necessary: sort tabs within each window using insertion-style sort
     */

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

    const newWindows: chrome.windows.Window[] = editedWindows.filter(win => newWindows_ids.has(win.id));

    // 1. create the windows consisting of detached tabs

    for (const newWindow of newWindows) {
      const tabsToDetach_ids: number[] = newWindow.tabs.map(tab => tab.id);
      const result: chrome.windows.Window = await chromep.windows.create({ tabId: tabsToDetach_ids[0] });

      // move additional detached tabs to new window
      if (tabsToDetach_ids.length > 1) {
        await chromep.tabs.move(tabsToDetach_ids.slice(1, tabsToDetach_ids.length), {windowId: result.id, index: -1});
      }
    }

    // 2. rearrange pre-existing windows' tabs

    // original and edited states of pre-existing windows that weren't closed via extension
    const windowsInCommon_original: chrome.windows.Window[] = this._windowsData
      .filter(win => windowsInCommon_ids.has(win.id));
    const windowsInCommon_edited: chrome.windows.Window[] = editedWindows
      .filter(win => windowsInCommon_ids.has(win.id));

    // maps of above windows' tab id arrays; key = windowId, value = set of tab ids
    const windowsInCommon_tabIds_original: { [windowId: number]: Set<number> } = { };
    const windowsInCommon_tabIds_edited: { [windowId: number]: Set<number> } = { };

    // populate tab id maps

    for (const window of windowsInCommon_original) {
      windowsInCommon_tabIds_original[window.id] = new Set(window.tabs.map(tab => tab.id));
    }

    for (const window of windowsInCommon_edited) {
      windowsInCommon_tabIds_edited[window.id] = new Set(window.tabs.map(tab => tab.id));
    }

    // ids of all detached tabs; used to differentiate between two types of tabs missing from edited windows: those
    // that were closed, and those that were detached
    const detachedTabIds: Set<number> = new Set();

    // populate detached tab id set
    for (const window of newWindows) {
      for (const tab of window.tabs) {
        detachedTabIds.add(tab.id);
      }
    }

    for (const windowInCommon_id of Array.from(windowsInCommon_ids)) {
      // set of ids of tabs present in the window, before and after modification
      const originalTabIds: Set<number> = windowsInCommon_tabIds_original[windowInCommon_id];
      const editedTabIds: Set<number> = windowsInCommon_tabIds_edited[windowInCommon_id];

      // remove tabs that got closed by the user via the extension

      const tabsToRemove_ids: number[] = Array.from(originalTabIds)
        .filter(id => !editedTabIds.has(id) && !detachedTabIds.has(id));
      await chromep.tabs.remove(tabsToRemove_ids);

      // insert into the window, in correct order, tabs that got added by the user via the extension

      const tabsToMove_ids: number[] = Array.from(editedTabIds).filter(id => !originalTabIds.has(id));

      // tabsKeysAfterRemoval contains the indices of the remaining tabs in terms of the tabs' final ordering in
      // editedTabIds, and is used to help insert the tabsToMove in the correct order
      const tabIdsAfterRemoval: number[] = Array.from(originalTabIds).filter(id => editedTabIds.has(id));
      const tabsKeysAfterRemoval: number[] = new Array(tabIdsAfterRemoval.length);

      // populate tab keys
      for (let i = 0; i < tabsKeysAfterRemoval.length; i++) {
        tabsKeysAfterRemoval[i] = Array.from(editedTabIds).indexOf(tabIdsAfterRemoval[i]);
      }

      // move in the tabs in the correct order
      for (const tabId of tabsToMove_ids) {
        const key: number = Array.from(editedTabIds).indexOf(tabId);

        for (let i = tabsKeysAfterRemoval.length; i > -1; i--) {
          let insertionPoint: number;

          if ((i === tabsKeysAfterRemoval.length && key > tabsKeysAfterRemoval[i - 1])  // tab belongs at the end
            || (i === 0 && key < tabsKeysAfterRemoval[i])                               // tab belongs at the beginning
            || ((i > 0 && i < tabsKeysAfterRemoval.length)                              // tab belongs somewhere in the middle
              && (key < tabsKeysAfterRemoval[i] && key > tabsKeysAfterRemoval[i - 1]))
          ) {
            insertionPoint = i;
          }


          if (insertionPoint !== undefined) {
            tabsKeysAfterRemoval.splice(insertionPoint, 0, key);
            await chromep.tabs.move(tabId, {index: insertionPoint, windowId: windowInCommon_id});
            break;
          }
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
