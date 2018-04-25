import { Injectable } from '@angular/core';
import { getCopy } from './utils';
import { WindowsService } from './windows.service';
import { Window } from './window';
import { Tab } from './tab';

@Injectable()
export class SortingSessionService {

  private _data: Window[];

  constructor(private windowsService: WindowsService) {
    windowsService.init().then(() => {
      this._data = windowsService.data;
    });
  }

  get data(): Window[] {
    return this._data;
  }

  createNewWindow(): void {
    // this._data.push(new Window());
  }

  applyChanges(): void {
    this.windowsService.update(this._data);
  }

  resetChanges(): void {
    this._data = this.windowsService.data;
  }

  // listen to a load new data event??

}
