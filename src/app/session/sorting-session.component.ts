/// <reference types="chrome"/>

import { Component, OnInit } from '@angular/core';
import { SortingSessionService } from '../sorting-session.service';

@Component({
  selector: 'app-session',
  templateUrl: './sorting-session.component.html',
  styleUrls: ['./sorting-session.component.css']
})
export class SortingSessionComponent {

  constructor(private sortingSessionService: SortingSessionService) { }

  resetChanges(): void {
    this.sortingSessionService.resetChanges();
  }

  applyChanges(): void {
    this.sortingSessionService.applyChanges();
  }

}
