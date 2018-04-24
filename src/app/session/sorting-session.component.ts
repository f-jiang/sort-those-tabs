/// <reference types="chrome"/>

import { Component, OnInit } from '@angular/core';
import { WindowsService } from '../windows.service';
import { getCopy } from '../utils';

@Component({
  selector: 'app-session',
  templateUrl: './sorting-session.component.html',
  styleUrls: ['./sorting-session.component.css']
})
export class SortingSessionComponent implements OnInit {

  data: chrome.windows.Window[];

  constructor(private windowsService: WindowsService) { }

  async ngOnInit(): Promise<void> {
    await this.windowsService.init();
    this.data = this.windowsService.windowsData;
  }

  resetChanges(): void {
    this.data = this.windowsService.windowsData;
  }

  async applyChanges(): Promise<void> {
    await this.windowsService.applyEditedWindows(this.data);
  }

}
