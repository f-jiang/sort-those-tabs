import { Component, Input, OnInit } from '@angular/core';
import { Window } from '../window';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.css']
})
export class WindowComponent implements OnInit {

  @Input() data: Window;

  constructor() { }

  ngOnInit() {
  }

}
