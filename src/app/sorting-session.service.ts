import { Injectable } from '@angular/core';
import { focusExtensionWindow, focusExtensionTab, getExtensionTabId } from './utils';
import { WindowsService } from './windows.service';
import { Window } from './window';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SortingSessionService {

  private _data: Window[];

  private _externalDataChangeSource: Subject<void> = new Subject<void>();
  public externalDataChange$: Observable<void> = this._externalDataChangeSource.asObservable();

  constructor(private windowsService: WindowsService) {
    this.addExternalChangeListeners();
  }

  async init(): Promise<void> {
    await this.windowsService.init();
    this.loadData();
  }

  get data(): Window[] {
    return this._data;
  }

  private loadData(): void {
    this._data = this.windowsService.data;
  }

  // use function expression so that this evaluates to the SortingSessionService instance
  private _onExternalDataChange: (() => Promise<void>) = async () => {
    await this.windowsService.loadData();
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

  async applyChanges(): Promise<void> {
    this.removeExternalChangeListeners();

    // remove any empty windows
    for (let i = 0; i < this._data.length; ) {
      if (this._data[i].tabs.length === 0) {
        this._data.splice(i, 1);
      } else {
        i++;
      }
    }

    await this.windowsService.update(this._data);
    this.loadData();

    // keep extension in focus
    await focusExtensionWindow();
    await focusExtensionTab();

    this.addExternalChangeListeners();
  }

  resetChanges(): void {
    this.loadData();
  }

  addWindow(window: Window): void {
    this._data.push(window);
  }

  async removeWindow(windowId: number): Promise<void> {
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

  removeTab(tabId: number): void {
    for (const window of this._data) {
      const tabIndex: number = window.tabs.findIndex(tab => tab.id === tabId);

      if (tabIndex !== -1) {
        window.tabs.splice(tabIndex, 1);
        break;
      }
    }
  }

}
