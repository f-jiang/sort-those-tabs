/// <reference types="chrome"/>

import { Component, OnInit } from '@angular/core';
import { WindowsService } from '../windows.service';
import { getCopy } from '../utils';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {

  data: chrome.windows.Window[];

  constructor(private windowsService: WindowsService) { }

  ngOnInit() {
    this.windowsService.windowsPromise.then((windows: chrome.windows.Window[]) => {
      this.data = getCopy(windows);
    });
  }

  resetChanges(): void {
    this.data = this.windowsService.windowsData;
  }

  async applyChanges(): Promise<void> {
    await this.windowsService.applyEditedWindows(this.data);
  }

}
