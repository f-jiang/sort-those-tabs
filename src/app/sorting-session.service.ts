import { Injectable } from '@angular/core';
import { focusExtensionWindow, focusExtensionTab, getExtensionTabId } from './utils';
import { WindowsService } from './windows.service';
import { Window } from './window';

@Injectable()
export class SortingSessionService {

  private _data: Window[];

  constructor(private windowsService: WindowsService) { }

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

  async applyChanges(): Promise<void> {
    // remove any empty windows
    for (let i = 0; i < this._data.length; ) {
      if (this._data[i].tabs.length === 0) {
        this._data.splice(i, 1);
      } else {
        i++;
      }
    }

    await this.windowsService.update(this._data);

    // after changes made to session via chrome api and windows service data updated, an event should be fired so that
    // the sorting session service's data is also updated and a chance arises to re-add the extra empty window
    this.loadData();

    // keep extension in focus
    await focusExtensionWindow();
    await focusExtensionTab();
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
