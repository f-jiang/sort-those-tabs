import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { UrlParser } from './url/url-parser';

import { Window } from './window';
import { Tab } from './tab';
import { WindowsService } from './windows.service';
import { focusExtensionWindow, focusExtensionTab, getExtensionTabId } from './utils';

@Injectable()
export class SortingSessionService {

  private _data: Window[];

  private _externalDataChangeSource: Subject<void> = new Subject<void>();
  public externalDataChange$: Observable<void> = this._externalDataChangeSource.asObservable();

  constructor(private _windowsService: WindowsService, private _urlParser: UrlParser) {
    this.addExternalChangeListeners();
  }

  // use function expression so that this evaluates to the SortingSessionService instance
  private _onExternalDataChange: (() => Promise<void>) = async () => {
    await this._windowsService.loadData();
    this.loadData();
    this._externalDataChangeSource.next();
  };

  private addExternalChangeListeners(): void {
    chrome.windows.onCreated.addListener(this._onExternalDataChange);
    chrome.windows.onRemoved.addListener(this._onExternalDataChange);
    chrome.tabs.onCreated.addListener(this._onExternalDataChange);
    chrome.tabs.onMoved.addListener(this._onExternalDataChange);
    chrome.tabs.onDetached.addListener(this._onExternalDataChange);
    chrome.tabs.onAttached.addListener(this._onExternalDataChange);
    chrome.tabs.onRemoved.addListener(this._onExternalDataChange);
  }

  private removeExternalChangeListeners(): void {
    chrome.windows.onCreated.removeListener(this._onExternalDataChange);
    chrome.windows.onRemoved.removeListener(this._onExternalDataChange);
    chrome.tabs.onCreated.removeListener(this._onExternalDataChange);
    chrome.tabs.onMoved.removeListener(this._onExternalDataChange);
    chrome.tabs.onDetached.removeListener(this._onExternalDataChange);
    chrome.tabs.onAttached.removeListener(this._onExternalDataChange);
    chrome.tabs.onRemoved.removeListener(this._onExternalDataChange);
  }

  private loadData(): void {
    this._data = this._windowsService.data;
  }

  public get data(): Window[] {
    return this._data;
  }

  public async init(): Promise<void> {
    await this._windowsService.init();
    this.loadData();
  }

  public async applyChanges(): Promise<void> {
    this.removeExternalChangeListeners();

    // remove any empty windows
    this._data = this._data.filter(window => window.tabs.length > 0);

    // edit chrome session
    await this._windowsService.update(this._data);
    this.loadData();

    // keep extension in focus
    await focusExtensionWindow();
    await focusExtensionTab();

    this.addExternalChangeListeners();
  }

  public resetChanges(): void {
    this.loadData();
  }

  public addWindow(window: Window): void {
    this._data.push(window);
  }

  public async removeWindow(windowId: number): Promise<void> {
    const windowToRemove_index: number = this._data.findIndex(window => window.id === windowId);

    if (windowToRemove_index !== -1) {
      const windowToRemove: Window = this._data[windowToRemove_index];
      const extensionTabId: number = await getExtensionTabId();
      const extensionTabIndex: number = windowToRemove.tabs.findIndex(tab => tab.id === extensionTabId);

      // if contains extension tab, close every other tab
      if (extensionTabIndex !== -1) {
        windowToRemove.tabs = windowToRemove.tabs.slice(extensionTabIndex, extensionTabIndex + 1);
      // else close entire window
      } else {
        this._data.splice(windowToRemove_index, 1);
      }
    }
  }

  public removeTab(tabId: number): void {
    for (const window of this._data) {
      const tabIndex: number = window.tabs.findIndex(tab => tab.id === tabId);

      if (tabIndex !== -1) {
        window.tabs.splice(tabIndex, 1);
        break;
      }
    }
  }

  public sortTabsByDomainName(windowId: number): void {
    const windowToSort: Window = this._data.find(window => window.id === windowId);

    if (windowToSort != null) {
      const domainNameRegex: RegExp = new RegExp('[\\w-]+\.\\w+$');

      windowToSort.tabs.sort((a: Tab, b: Tab): number => {
        const hostnameA: string = this._urlParser.parse(a.url, false).hostname;
        const hostnameB: string = this._urlParser.parse(b.url, false).hostname;
        const domainNameA: string = hostnameA.match(domainNameRegex)[0];
        const domainNameB: string = hostnameB.match(domainNameRegex)[0];
        return domainNameA.localeCompare(domainNameB);
      });
    }
  }

  public sortTabsByTitle(windowId: number): void {
    const windowToSort: Window = this._data.find(window => window.id === windowId);

    if (windowToSort != null) {
      windowToSort.tabs.sort((a: Tab, b: Tab): number => {
        return a.title.localeCompare(b.title);
      });
    }
  }

  public removeDuplicateTabs(windowId: number): void {
    const windowToDeduplicate: Window = this._data.find(window => window.id === windowId);

    if (windowToDeduplicate != null) {
      const tabIdsSet: Set<string> = new Set();

      windowToDeduplicate.tabs = windowToDeduplicate.tabs.filter((tab): boolean => {
        const isTabUnique: boolean = !tabIdsSet.has(tab.url);

        if (isTabUnique) {
          tabIdsSet.add(tab.url);
        }

        return isTabUnique;
      });
    }
  }

}
