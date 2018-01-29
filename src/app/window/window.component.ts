/// <reference types="chrome"/>

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.css']
})
export class WindowComponent implements OnInit {

  @Input() data: chrome.windows.Window;

  constructor() { }

  ngOnInit() {
  }

}
